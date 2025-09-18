import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import sinon from 'sinon'
import AuthServiceMock, { TEST_AUTH_USER_ID } from '#tests/mocks/auth_service_mock'
import { StripeException } from '#exceptions/payment_exception'
import { AdFactory } from '#database/factories/ad'
import { CardFactory } from '#database/factories/card'
import { SetFactory } from '#database/factories/set'
import { LegalityFactory } from '#database/factories/legality'
import { RarityFactory } from '#database/factories/rarity'
import { ArtistFactory } from '#database/factories/artist'
import { AdStatusFactory } from '#database/factories/ad_status'
import { CardConditionFactory } from '#database/factories/card_condition'
import { CardFinishFactory } from '#database/factories/card_finish'
import { UserFactory } from '#database/factories/user'
import { PaymentIntentFactory } from '#database/factories/payment_intent'
import StripeClientMock from '#tests/mocks/stripe_client_mock'
import PaymentIntent from '#models/payment_intent'
import StripeApiClient from '#clients/stripe_api_client'

test.group('Payment controller', (group) => {
  let wardenApiClientStub: sinon.SinonStub
  let stripeApiClientCreateAccountStub: sinon.SinonStub
  let stripeApiClientLinkAccountStub: sinon.SinonStub
  let stripeApiClientCreatePaymentSheetStub: sinon.SinonStub
  let stripeWebhookStub: sinon.SinonStub
  let stripeApiClient: StripeApiClient

  group.setup(() => {
    wardenApiClientStub = AuthServiceMock.setupWardenApiClientStub()
    stripeApiClientCreateAccountStub = StripeClientMock.createStripeAccount()
    stripeApiClientLinkAccountStub = StripeClientMock.linkStripeAccount()
    stripeApiClientCreatePaymentSheetStub = StripeClientMock.createPaymentSheet()
    stripeWebhookStub = StripeClientMock.stripeWebhook('payment_intent.succeeded')
    stripeApiClient = new StripeApiClient()
  })

  group.each.setup(() => testUtils.db().withGlobalTransaction())

  group.teardown(() => {
    wardenApiClientStub.restore()
    stripeApiClientCreateAccountStub.restore()
    stripeApiClientLinkAccountStub.restore()
    stripeApiClientCreatePaymentSheetStub.restore()
    stripeWebhookStub.restore()
  })

  test('createAccount - should create Stripe account and update user', async ({ client }) => {
    const response = await client
      .get('/api/v1/payment/account')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)
    response.assertBodyContains({ linkingUrl: 'https://stripe.com/linking-url' })
  })

  test('createAccount - should bubble up error if payment service fails', async ({ client }) => {
    stripeApiClientCreateAccountStub.rejects(
      new StripeException('Unknown error occured with Stripe')
    )
    const response = await client
      .get('/api/v1/payment/account')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(500)
    response.assertBodyContains({
      message: 'Unknown error occured with Stripe',
      code: 'E_STRIPE_EXCEPTION',
    })
  })

  test('getPublishableKey - should return publishable key', async ({ client }) => {
    const response = await client
      .get('/api/v1/payment/publishablekey')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)
    response.assertBodyContains({
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    })
  })

  test('createPaymentSheet - should create payment sheet', async ({ client, assert }) => {
    const artist = await ArtistFactory.create()
    const rarity = await RarityFactory.create()
    const legality = await LegalityFactory.create()
    const set = await SetFactory.merge({ legalityId: legality.id }).create()
    const card = await CardFactory.merge({
      setId: set.id,
      artistId: artist.id,
      rarityId: rarity.id,
      legalityId: legality.id,
    }).create()
    const adStatus = await AdStatusFactory.merge({ id: 1 }).create()
    await AdStatusFactory.merge({ id: 2 }).create()
    const condition = await CardConditionFactory.create()
    const finish = await CardFinishFactory.create()
    const user = await UserFactory.merge({ stripeId: 'acct_12345' }).create()
    const ad = await AdFactory.merge({
      cardId: card.id,
      sellerId: user.id,
      originalPrice: 10,
      statusId: adStatus.id,
      conditionId: condition.id,
      finishId: finish.id,
    }).create()

    const response = await client
      .get(`/api/v1/payment/${ad.id}/sheet`)
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)
    response.assertBodyContains({
      paymentIntent: 'psec_12345',
      ephemeralKey: 'ek_12345',
      customer: 'cus_12345',
    })

    const updatedAd = await ad.refresh()
    assert.isTrue(updatedAd.statusId === 2)
    const paymentIntent = await PaymentIntent.query().where('adId', ad.id).first()
    assert.isNotNull(paymentIntent)
    assert.equal(paymentIntent?.status, 'created')
    assert.equal(paymentIntent?.fromId, TEST_AUTH_USER_ID)
    assert.equal(paymentIntent?.toId, user.id)
    assert.equal(paymentIntent?.adId, ad.id)
    assert.equal(paymentIntent?.id, 'pi_12345')
  })

  test('createPaymentSheet - should throw if update ad creates error', async ({ client }) => {
    const response = await client
      .get('/api/v1/payment/ad_12345/sheet')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(404)
    response.assertBodyContains({
      message: 'Ad not found',
      code: 'E_ROW_NOT_FOUND',
    })
  })

  test('createPaymentSheet - should throw error if payment sheet creation fails', async ({
    client,
    assert,
  }) => {
    const artist = await ArtistFactory.create()
    const rarity = await RarityFactory.create()
    const legality = await LegalityFactory.create()
    const set = await SetFactory.merge({ legalityId: legality.id }).create()
    const card = await CardFactory.merge({
      setId: set.id,
      artistId: artist.id,
      rarityId: rarity.id,
      legalityId: legality.id,
    }).create()
    const adStatus = await AdStatusFactory.merge({ id: 1 }).create()
    await AdStatusFactory.merge({ id: 2 }).create()
    const condition = await CardConditionFactory.create()
    const finish = await CardFinishFactory.create()
    const user = await UserFactory.merge({ stripeId: 'acct_12345' }).create()
    const ad = await AdFactory.merge({
      cardId: card.id,
      sellerId: user.id,
      originalPrice: 10,
      statusId: adStatus.id,
      conditionId: condition.id,
      finishId: finish.id,
    }).create()
    stripeApiClientCreatePaymentSheetStub.rejects(
      new StripeException('Unknown error occured with Stripe')
    )
    const response = await client
      .get(`/api/v1/payment/${ad.id}/sheet`)
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(500)
    const body = response.body()
    assert.equal(body.message, 'Unknown error occured with Stripe')
    assert.equal(body.code, 'E_STRIPE_EXCEPTION')
  })

  test('createPaymentSheet - should throw error if payment intent already exists', async ({
    client,
    assert,
  }) => {
    const artist = await ArtistFactory.create()
    const rarity = await RarityFactory.create()
    const legality = await LegalityFactory.create()
    const set = await SetFactory.merge({ legalityId: legality.id }).create()
    const card = await CardFactory.merge({
      setId: set.id,
      artistId: artist.id,
      rarityId: rarity.id,
      legalityId: legality.id,
    }).create()
    const adStatus = await AdStatusFactory.merge({ id: 1 }).create()
    await AdStatusFactory.merge({ id: 2 }).create()
    const condition = await CardConditionFactory.create()
    const finish = await CardFinishFactory.create()
    const user = await UserFactory.merge({ stripeId: 'acct_12345' }).create()
    const ad = await AdFactory.merge({
      cardId: card.id,
      sellerId: user.id,
      originalPrice: 10,
      statusId: adStatus.id,
      conditionId: condition.id,
      finishId: finish.id,
    }).create()

    await PaymentIntentFactory.merge({
      id: 'pi_12345',
      fromId: TEST_AUTH_USER_ID,
      toId: user.id,
      adId: ad.id,
      status: 'created',
    }).create()

    const response = await client
      .get(`/api/v1/payment/${ad.id}/sheet`)
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(409)
    const body = response.body()
    assert.equal(body.message, `Ad #${ad.id} is not currently available for purchase`)
    assert.equal(body.code, 'E_PAYMENT_INTENT_DUPLICATE')
  })

  test('cancelPaymentSheet - should cancel payment sheet', async ({ client }) => {
    const artist = await ArtistFactory.create()
    const rarity = await RarityFactory.create()
    const legality = await LegalityFactory.create()
    const set = await SetFactory.merge({ legalityId: legality.id }).create()
    const card = await CardFactory.merge({
      setId: set.id,
      artistId: artist.id,
      rarityId: rarity.id,
      legalityId: legality.id,
    }).create()
    const adStatus = await AdStatusFactory.merge({ id: 2 }).create()
    await AdStatusFactory.merge({ id: 1 }).create()
    const condition = await CardConditionFactory.create()
    const finish = await CardFinishFactory.create()
    const user = await UserFactory.merge({ stripeId: 'acct_12345' }).create()
    const ad = await AdFactory.merge({
      cardId: card.id,
      sellerId: user.id,
      originalPrice: 10,
      statusId: adStatus.id,
      conditionId: condition.id,
      finishId: finish.id,
    }).create()

    await PaymentIntentFactory.merge({
      id: 'pi_12345',
      fromId: TEST_AUTH_USER_ID,
      toId: user.id,
      adId: ad.id,
      status: 'created',
    }).create()

    const response = await client
      .patch('/api/v1/payment/sheet')
      .header('Authorization', 'Bearer fake-token-for-testing')
      .json({ id: ad.id })

    response.assertStatus(200)
    response.assertBodyContains({
      hasBeenCanceled: true,
    })
  })

  test('stripeWebhook - should handle webhook event', async ({ client, assert }) => {
    const artist = await ArtistFactory.create()
    const rarity = await RarityFactory.create()
    const legality = await LegalityFactory.create()
    const set = await SetFactory.merge({ legalityId: legality.id }).create()
    const card = await CardFactory.merge({
      setId: set.id,
      artistId: artist.id,
      rarityId: rarity.id,
      legalityId: legality.id,
    }).create()
    const adStatus = await AdStatusFactory.merge({ id: 2 }).create()
    await AdStatusFactory.merge({ id: 1 }).create()
    const condition = await CardConditionFactory.create()
    const finish = await CardFinishFactory.create()
    const user = await UserFactory.merge({ stripeId: 'acct_12345' }).create()
    const ad = await AdFactory.merge({
      cardId: card.id,
      sellerId: user.id,
      originalPrice: 10,
      statusId: adStatus.id,
      conditionId: condition.id,
      finishId: finish.id,
    }).create()

    await PaymentIntentFactory.merge({
      id: 'pi_12345',
      fromId: TEST_AUTH_USER_ID,
      toId: user.id,
      adId: ad.id,
      status: 'created',
    }).create()

    const payload = {
      id: 'evt_test_webhook',
      data: {
        object: {
          id: 'pi_12345',
          object: 'payment_intent',
        },
      },
      type: 'payment_intent.succeeded',
    }

    const payloadString = JSON.stringify(payload)
    const secret = 'whsec_test_secret'

    const header = stripeApiClient.webhooks.generateTestHeaderString({
      payload: payloadString,
      secret,
    })
    stripeWebhookStub.resolves(payload)

    const response = await client
      .post('/api/v1/payment/webhook')
      .header('Content-Type', 'application/json')
      .header('Stripe-Signature', header)
      .json(payload)

    response.assertStatus(200)
    assert.isTrue(stripeWebhookStub.calledOnce)
  })

  test('stripeWebhook - should throw row not found if webhook event fails update payment intent', async ({
    client,
  }) => {
    const payload = {
      id: 'evt_test_webhook',
      data: {
        object: {
          id: 'pi_12345',
          object: 'payment_intent',
        },
      },
      type: 'payment_intent.payment_failed',
    }
    const payloadString = JSON.stringify(payload, null, 2)
    const secret = 'whsec_test_secret'

    const header = stripeApiClient.webhooks.generateTestHeaderString({
      payload: payloadString,
      secret,
    })

    const response = await client
      .post('/api/v1/payment/webhook')
      .header('Content-Type', 'application/json')
      .header('Stripe-Signature', header)
      .json(payload)

    response.assertStatus(404)
    response.assertBodyContains({
      message: 'PaymentIntent not found',
      code: 'E_ROW_NOT_FOUND',
    })
  })

  test('stripeWebhook - should return 500 if signature is missing when webhook secret is set', async ({
    client,
  }) => {
    const webhookEvent = {
      id: 'evt_12345',
      object: 'event',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_12345',
          object: 'payment_intent',
        },
      },
    }

    const response = await client
      .post('/api/v1/payment/webhook')
      .header('Content-Type', 'application/json')
      .json(webhookEvent)

    response.assertStatus(422)
  })
})
