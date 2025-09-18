import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import sinon from 'sinon'
import AuthServiceMock, { TEST_AUTH_USER_ID } from '#tests/mocks/auth_service_mock'
import PaymentService from '#services/payment_service'
import MeService from '#services/me_service'
import { errors as lucidErrors } from '@adonisjs/lucid'
import { StripeException } from '#exceptions/payment_exception'
import StripeApiClient from '#clients/stripe_api_client'
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
import AdService from '#services/ad_service'
import PaymentIntentService from '#services/payment_intent_service'
import { PaymentIntentFactory } from '#database/factories/payment_intent'
import PaymentIntentDuplicateException from '#exceptions/payment_intent_duplicate_exception'

test.group('Payment controller', (group) => {
  let wardenApiClientStub: sinon.SinonStub
  let paymentServiceStub: sinon.SinonStub
  let meServiceStub: sinon.SinonStub
  let stripeApiClient: StripeApiClient
  let adServiceUpdateAdStub: sinon.SinonStub
  let adServiceGetStripePaymentRelevantColumnsStub: sinon.SinonStub
  let paymentIntentServiceStub: sinon.SinonStub
  let paymentServiceCreatePaymentSheetStub: sinon.SinonStub
  let stripeWebhookStub: sinon.SinonStub
  let paymentIntentExistingServiceStub: sinon.SinonStub
  let meServiceGetCustomerIdStub: sinon.SinonStub

  group.setup(() => {
    wardenApiClientStub = AuthServiceMock.setupWardenApiClientStub()
    paymentServiceStub = sinon.stub(PaymentService.prototype, 'createAccount')
    meServiceStub = sinon.stub(MeService.prototype, 'updateUser')
    stripeApiClient = new StripeApiClient()
    adServiceUpdateAdStub = sinon.stub(AdService.prototype, 'updateAd')
    adServiceGetStripePaymentRelevantColumnsStub = sinon.stub(
      AdService.prototype,
      'getStripePaymentRelevantColumnsAdById'
    )
    paymentIntentServiceStub = sinon.stub(PaymentIntentService.prototype, 'createPaymentIntent')
    paymentIntentExistingServiceStub = sinon.stub(
      PaymentIntentService.prototype,
      'getPaymentIntentByAdId'
    )
    paymentServiceCreatePaymentSheetStub = sinon.stub(
      PaymentService.prototype,
      'createPaymentSheet'
    )
    stripeWebhookStub = sinon.stub(StripeApiClient.prototype, 'stripeWebhook')
    meServiceGetCustomerIdStub = sinon.stub(MeService.prototype, 'getCustomerIdByUserId')
  })

  group.each.setup(() => testUtils.db().withGlobalTransaction())

  group.teardown(() => {
    wardenApiClientStub.restore()
    paymentServiceStub.restore()
    meServiceStub.restore()
    adServiceGetStripePaymentRelevantColumnsStub.restore()
    adServiceUpdateAdStub.restore()
    paymentIntentServiceStub.restore()
    paymentServiceCreatePaymentSheetStub.restore()
    stripeWebhookStub.restore()
    paymentIntentExistingServiceStub.restore()
    meServiceGetCustomerIdStub.restore()
  })

  test('createAccount - should create Stripe account and update user', async ({
    client,
    assert,
  }) => {
    paymentServiceStub.resolves({
      linkingUrl: 'https://stripe.com/linking-url',
      accountId: 'acct_12345',
    })
    meServiceStub.resolves({ id: TEST_AUTH_USER_ID, stripeId: 'acct_12345' })

    const response = await client
      .get('/api/v1/payment/account')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)
    response.assertBodyContains({ linkingUrl: 'https://stripe.com/linking-url' })

    assert.isTrue(paymentServiceStub.calledOnce)
    assert.isTrue(meServiceStub.calledWith(TEST_AUTH_USER_ID, { stripeId: 'acct_12345' }))
  })

  test('createAccount - should return 404 if user is not found', async ({ client }) => {
    paymentServiceStub.resolves({
      linkingUrl: 'https://stripe.com/linking-url',
      accountId: 'acct_12345',
    })
    meServiceStub.rejects(new lucidErrors.E_ROW_NOT_FOUND())

    const response = await client
      .get('/api/v1/payment/account')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(404)
    response.assertBodyContains({
      message: 'Row not found',
      code: 'E_ROW_NOT_FOUND',
    })
  })

  test('createAccount - should bubble up error if payment service fails', async ({
    client,
    assert,
  }) => {
    paymentServiceStub.rejects(new StripeException())
    meServiceStub.resolves() // not called

    const response = await client
      .get('/api/v1/payment/account')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(500)

    const body = response.body()
    assert.equal(body.message, 'Unknown error occured with Stripe')
    assert.equal(body.code, 'E_STRIPE_EXCEPTION')
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
    await ArtistFactory.merge({ id: 1 }).create()
    await RarityFactory.merge({ id: 1 }).create()
    await LegalityFactory.merge({ id: 1 }).create()
    await SetFactory.merge({ id: 'base1', legalityId: 1 }).create()
    await CardFactory.merge({
      id: 'card_12345',
      setId: 'base1',
      artistId: 1,
      rarityId: 1,
      legalityId: 1,
    }).create()
    await AdStatusFactory.merge({ id: 1 }).create()
    await CardConditionFactory.merge({ id: 1 }).create()
    await CardFinishFactory.merge({ id: 1 }).create()
    await UserFactory.merge({ id: 'user_67890', stripeId: 'acct_12345' }).create()
    await AdFactory.merge({
      id: 'ad_12345',
      cardId: 'card_12345',
      sellerId: 'user_67890',
      originalPrice: 10,
    }).create()

    paymentIntentExistingServiceStub.resolves(null)

    paymentServiceCreatePaymentSheetStub.resolves({
      paymentIntentClientSecret: 'psec_12345',
      paymentIntentId: 'pi_12345',
      ephemeralKey: 'ek_12345',
      customer: 'cus_12345',
    })

    adServiceGetStripePaymentRelevantColumnsStub.resolves({
      originalPrice: 10,
    })

    meServiceGetCustomerIdStub.resolves(null)

    adServiceUpdateAdStub.resolves({
      id: 'ad_12345',
      cardId: 'card_12345',
      sellerId: 'user_67890',
      statusId: 2,
      originalPrice: 10,
    })

    paymentIntentServiceStub.resolves({
      id: 'pi_12345',
      fromId: '123',
      toId: 'user_67890',
      adId: 'ad_12345',
      status: 'created',
    })

    const response = await client
      .get('/api/v1/payment/ad_12345/sheet')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)
    response.assertBodyContains({
      paymentIntent: 'psec_12345',
      ephemeralKey: 'ek_12345',
      customer: 'cus_12345',
    })

    assert.isTrue(adServiceUpdateAdStub.calledWith('ad_12345', { statusId: 2 }))
    assert.isTrue(
      paymentIntentServiceStub.calledWith({
        id: 'pi_12345',
        fromId: '123',
        toId: 'user_67890',
        adId: 'ad_12345',
        status: 'created',
      })
    )

    assert.isTrue(paymentServiceCreatePaymentSheetStub.calledOnce)
  })

  test('createPaymentSheet - should throw if update ad creates error', async ({ client }) => {
    paymentServiceCreatePaymentSheetStub.resolves({
      paymentIntentClientSecret: 'pi_12345',
      paymentIntentId: 'pi_12345',
      ephemeralKey: 'ek_12345',
      customer: 'cus_12345',
    })

    adServiceUpdateAdStub.rejects(new lucidErrors.E_ROW_NOT_FOUND())
    paymentIntentServiceStub.rejects()

    const response = await client
      .get('/api/v1/payment/ad_12345/sheet')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(404)
    response.assertBodyContains({
      message: 'Row not found',
      code: 'E_ROW_NOT_FOUND',
    })
  })

  test('createPaymentSheet - should throw error if payment sheet creation fails', async ({
    client,
    assert,
  }) => {
    paymentServiceCreatePaymentSheetStub.rejects(new StripeException())

    const response = await client
      .get('/api/v1/payment/ad_12345/sheet')
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
    paymentIntentExistingServiceStub.rejects(new PaymentIntentDuplicateException('ad_12345'))

    const response = await client
      .get('/api/v1/payment/ad_12345/sheet')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(409)
    const body = response.body()
    assert.equal(body.message, 'Ad #ad_12345 is not currently available for purchase')
    assert.equal(body.code, 'E_PAYMENT_INTENT_DUPLICATE')
  })

  // test('cancelPaymentSheet - should cancel payment sheet', async ({ client, assert }) => {
  //   await ArtistFactory.merge({ id: 1 }).create()
  //   await RarityFactory.merge({ id: 1 }).create()
  //   await LegalityFactory.merge({ id: 1 }).create()
  //   await SetFactory.merge({ id: 'base1' }).create()
  //   await CardFactory.merge({
  //     id: 'card_12345',
  //     setId: 'base1',
  //     artistId: 1,
  //     rarityId: 1,
  //     legalityId: 1,
  //   }).create()
  //   await AdStatusFactory.merge({ id: 1 }).create()
  //   await CardConditionFactory.merge({ id: 1 }).create()
  //   await CardFinishFactory.merge({ id: 1 }).create()
  //   const sellerId = await UserFactory.merge({ id: 'user_6789', stripeId: 'acct_12345' }).create()
  //   const ad = await AdFactory.merge({
  //     id: 'ad_12345',
  //     cardId: 'card_12345',
  //     sellerId: sellerId.id,
  //   }).create()

  //   await PaymentIntentFactory.merge({
  //     id: 'pi_12345',
  //     fromId: TEST_AUTH_USER_ID,
  //     toId: sellerId.id,
  //     adId: ad.id,
  //     status: 'created',
  //   }).create()

  //   const response = await client
  //     .patch('/api/v1/payment/sheet')
  //     .header('Authorization', 'Bearer fake-token-for-testing')
  //     .json({ id: ad.id })

  //   response.assertStatus(200)
  //   response.assertBodyContains({
  //     hasBeenCanceled: true,
  //   })

  //   assert.isTrue(adServiceUpdateAdStub.calledWith(ad.id, { statusId: 1 }))
  // })

  test('stripeWebhook - should handle webhook event', async ({ client, assert }) => {
    await ArtistFactory.merge({ id: 1 }).create()
    await RarityFactory.merge({ id: 1 }).create()
    await LegalityFactory.merge({ id: 1 }).create()
    await SetFactory.merge({ id: 'base1' }).create()
    await CardFactory.merge({
      id: 'card_12345',
      setId: 'base1',
      artistId: 1,
      rarityId: 1,
      legalityId: 1,
    }).create()
    await AdStatusFactory.merge({ id: 1 }).create()
    await CardConditionFactory.merge({ id: 1 }).create()
    await CardFinishFactory.merge({ id: 1 }).create()
    const user = await UserFactory.merge({ id: 'user_67890', stripeId: 'acct_12345' }).create()
    const ad = await AdFactory.merge({
      id: 'ad_12345',
      cardId: 'card_12345',
      sellerId: 'user_67890',
    }).create()

    await PaymentIntentFactory.merge({
      id: 'pi_12345',
      fromId: user.id,
      toId: 'user_67890',
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

  test('stripeWebhook - should throw row not found if webhook event fails update ad', async ({
    client,
  }) => {
    await ArtistFactory.merge({ id: 1 }).create()
    await RarityFactory.merge({ id: 1 }).create()
    await LegalityFactory.merge({ id: 1 }).create()
    await SetFactory.merge({ id: 'base1' }).create()
    await CardFactory.merge({
      id: 'card_12345',
      setId: 'base1',
      artistId: 1,
      rarityId: 1,
      legalityId: 1,
    }).create()
    await AdStatusFactory.merge({ id: 1 }).create()
    await CardConditionFactory.merge({ id: 1 }).create()
    await CardFinishFactory.merge({ id: 1 }).create()
    const user = await UserFactory.merge({ id: 'user_67890', stripeId: 'acct_12345' }).create()
    const ad = await AdFactory.merge({
      id: 'ad_12345',
      cardId: 'card_12345',
      sellerId: 'user_67890',
    }).create()

    await PaymentIntentFactory.merge({
      id: 'pi_12345',
      fromId: user.id,
      toId: 'user_67890',
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
      type: 'payment_intent.payment_failed',
    }
    const payloadString = JSON.stringify(payload, null, 2)
    const secret = 'whsec_test_secret'

    const header = stripeApiClient.webhooks.generateTestHeaderString({
      payload: payloadString,
      secret,
    })
    stripeWebhookStub.resolves(payload)
    adServiceUpdateAdStub.rejects(new lucidErrors.E_ROW_NOT_FOUND())

    const response = await client
      .post('/api/v1/payment/webhook')
      .header('Content-Type', 'application/json')
      .header('Stripe-Signature', header)
      .json(payload)

    response.assertStatus(404)
    response.assertBodyContains({
      message: 'Row not found',
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
