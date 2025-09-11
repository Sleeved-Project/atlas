import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import sinon from 'sinon'
import AuthServiceMock, { TEST_AUTH_USER_ID } from '#tests/mocks/auth_service_mock'
import PaymentService from '#services/payment_service'
import MeService from '#services/me_service'
import { errors as lucidErrors } from '@adonisjs/lucid'
import { StripeException } from '#exceptions/payment_exception'
import StripeApiClient from '#clients/stripe_api_client'

test.group('Payment controller', (group) => {
  let wardenApiClientStub: sinon.SinonStub
  let paymentServiceStub: sinon.SinonStub
  let meServiceStub: sinon.SinonStub
  let stripeApiClient: StripeApiClient
  let adServiceStub: sinon.SinonStub
  let paymentIntentServiceStub: sinon.SinonStub
  let paymentServiceCreatePaymentSheetStub: sinon.SinonStub

  group.setup(() => {
    wardenApiClientStub = AuthServiceMock.setupWardenApiClientStub()
    paymentServiceStub = sinon.stub(PaymentService.prototype, 'createAccount')
    meServiceStub = sinon.stub(MeService.prototype, 'updateUser')
    stripeApiClient = new StripeApiClient()
    adServiceStub = sinon.stub()
    paymentIntentServiceStub = sinon.stub()
    paymentServiceCreatePaymentSheetStub = sinon.stub(
      PaymentService.prototype,
      'createPaymentSheet'
    )
  })

  group.each.setup(() => testUtils.db().withGlobalTransaction())

  group.teardown(() => {
    wardenApiClientStub.restore()
    paymentServiceStub.restore()
    meServiceStub.restore()
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
      publishableKey: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY,
    })
  })

  test('createPaymentSheet - should create payment sheet', async ({ client, assert }) => {
    // TODO use ad factory to create ad and use its id in the request
    paymentServiceCreatePaymentSheetStub.resolves({
      paymentIntentClientSecret: 'pi_12345',
      paymentIntentId: 'pi_12345',
      ephemeralKey: 'ek_12345',
      customer: 'cus_12345',
    })

    adServiceStub.resolves({ id: 'ad_12345', userId: 'user_12345' })
    paymentIntentServiceStub.resolves({
      id: 'pi_12345',
      fromId: 'user_12345',
      toId: 'user_67890',
      adId: 'ad_12345',
    })

    const response = await client
      .get('/api/v1/payment/ad_12345/sheet')
      .header('Authorization', 'Bearer fake-token-for-testing')
    console.log('response', response.body())

    response.assertStatus(200)
    response.assertBodyContains({
      paymentIntent: 'pi_12345',
      ephemeralKey: 'ek_12345',
      customer: 'cus_12345',
    })

    assert.isTrue(adServiceStub.calledWith('ad_12345', { stripeId: 'acct_12345' }))
    assert.isTrue(
      paymentIntentServiceStub.calledOnceWith({
        id: 'pi_12345',
        fromId: 'user_12345',
        toId: 'user_67890',
        adId: 'ad_12345',
      })
    )

    assert.isTrue(paymentServiceCreatePaymentSheetStub.calledOnceWith(TEST_AUTH_USER_ID))

    paymentServiceCreatePaymentSheetStub.restore()
  })

  test('createPaymentSheet - should throw if update ad creates error', async ({ client }) => {
    paymentServiceCreatePaymentSheetStub.resolves({
      paymentIntentClientSecret: 'pi_12345',
      paymentIntentId: 'pi_12345',
      ephemeralKey: 'ek_12345',
      customer: 'cus_12345',
    })

    adServiceStub.rejects(new lucidErrors.E_ROW_NOT_FOUND())
    paymentIntentServiceStub.resolves({
      id: 'pi_12345',
      fromId: 'user_12345',
      toId: 'user_67890',
      adId: 'ad_12345',
    })

    const response = await client
      .get('/api/v1/payment/ad_12345/sheet')
      .header('Authorization', 'Bearer fake-token-for-testing')
    console.log('response', response.body())

    response.assertStatus(404)
    response.assertBodyContains({
      message: 'Ad not found',
      code: 'E_ROW_NOT_FOUND',
    })
    paymentServiceCreatePaymentSheetStub.restore()
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

    paymentServiceCreatePaymentSheetStub.restore()
  })

  test('stripeWebhook - should handle webhook event', async ({ client, assert }) => {
    const payload = {
      id: 'evt_test_webhook',
      object: 'event',
    }

    const payloadString = JSON.stringify(payload, null, 2)
    const secret = 'whsec_test_secret'

    const header = stripeApiClient.webhooks.generateTestHeaderString({
      payload: payloadString,
      secret,
    })

    const stripeWebhookStub = sinon.stub(StripeApiClient.prototype, 'stripeWebhook').resolves()

    const response = await client
      .post('/api/v1/payment/webhook')
      .header('Content-Type', 'application/json')
      .header('Stripe-Signature', header)
      .json(payload)

    response.assertStatus(200)
    assert.isTrue(stripeWebhookStub.calledOnce)

    stripeWebhookStub.restore()
  })

  test('stripeWebhook - should return 500 if signature is missing when webhook secret is set', async ({
    client,
    assert,
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

    response.assertStatus(500)
    const body = response.body()
    assert.equal(body.message, 'Unknown error occured with Stripe')
    assert.equal(body.code, 'E_STRIPE_EXCEPTION')
  })
})
