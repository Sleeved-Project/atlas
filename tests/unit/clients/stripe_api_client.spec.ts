import { test } from '@japa/runner'
import sinon from 'sinon'
import StripeApiClient from '#clients/stripe_api_client'
import { StripeException } from '#exceptions/payment_exception'

test.group('StripeApiClient', (group) => {
  let stripeApiClient: StripeApiClient
  let accountsStub: any
  let accountLinksStub: any
  let customer: any
  let ephemeralKey: any
  let paymentIntent: any

  group.each.setup(() => {
    stripeApiClient = new StripeApiClient()

    // Stub Stripe SDK methods
    accountsStub = sinon.stub(stripeApiClient['stripe'].accounts, 'create')
    accountLinksStub = sinon.stub(stripeApiClient['stripe'].accountLinks, 'create')
    customer = sinon.stub(stripeApiClient['stripe'].customers, 'create')
    ephemeralKey = sinon.stub(stripeApiClient['stripe'].ephemeralKeys, 'create')
    paymentIntent = sinon.stub(stripeApiClient['stripe'].paymentIntents, 'create')
    sinon.stub(stripeApiClient['stripe'].accounts, 'del')
  })

  group.each.teardown(() => {
    sinon.restore()
  })

  test('createStripeAccount - should return account id when successful', async ({ assert }) => {
    accountsStub.resolves({ id: 'acct_123' })

    const result = await stripeApiClient.createStripeAccount()
    assert.equal(result, 'acct_123')
  })

  test('createStripeAccount - should throw StripeException when Stripe fails', async ({
    assert,
  }) => {
    accountsStub.rejects(new Error('Stripe down'))

    await assert.rejects(async () => {
      await stripeApiClient.createStripeAccount()
    }, StripeException.message)
  })

  test('linkStripeAccount - should return account link when successful', async ({ assert }) => {
    accountLinksStub.resolves({ url: 'https://stripe.com/link' })

    const result = await stripeApiClient.linkStripeAccount(
      'acct_123',
      'https://return',
      'https://refresh'
    )
    assert.deepEqual(result, { url: 'https://stripe.com/link' })
  })

  test('linkStripeAccount - should throw StripeException when Stripe fails', async ({ assert }) => {
    accountLinksStub.rejects(new Error('Bad request'))

    await assert.rejects(async () => {
      await stripeApiClient.linkStripeAccount('acct_123', 'https://return', 'https://refresh')
    }, StripeException.message)
  })

  test('deleteStripeAccount - should return account id when successful', async ({ assert }) => {
    const deleteStub = stripeApiClient['stripe'].accounts.del as sinon.SinonStub
    deleteStub.resolves({ id: 'acct_123' })

    const result = await stripeApiClient.deleteStripeAccount('acct_123')
    assert.equal(result, 'acct_123')
  })

  test('deleteStripeAccount - should throw StripeException when Stripe fails', async ({
    assert,
  }) => {
    const deleteStub = stripeApiClient['stripe'].accounts.del as sinon.SinonStub
    deleteStub.rejects(new Error('Stripe delete error'))

    await assert.rejects(async () => {
      await stripeApiClient.deleteStripeAccount('acct_123')
    }, StripeException.message)
  })

  test('createPaymentSheet - should return customer, ephemeralKey and paymentIntent when successful', async ({
    assert,
  }) => {
    customer.resolves({ id: 'cus_123' })
    ephemeralKey.resolves({ secret: 'ephkey_123' })
    paymentIntent.resolves({ client_secret: 'secret_123', id: 'pi_123' })
    const result = await stripeApiClient.createPaymentSheet(1000)

    assert.deepEqual(result, {
      customer: 'cus_123',
      ephemeralKey: 'ephkey_123',
      paymentIntentClientSecret: 'secret_123',
      paymentIntentId: 'pi_123',
    })
  })

  test('createPaymentSheet - should throw StripeException when Stripe fails', async ({
    assert,
  }) => {
    customer.rejects(new Error('Stripe customer error'))

    await assert.rejects(async () => {
      await stripeApiClient.createPaymentSheet(1000)
    }, StripeException.message)
  })

  test('stripeWebhook - should return void when successful', async ({ assert }) => {
    const payload = { id: 'evt_123', type: 'payment_intent.succeeded' }

    const constructEventStub = sinon
      .stub(stripeApiClient['stripe'].webhooks, 'constructEvent')
      .returns(payload as any)

    const result = await stripeApiClient.stripeWebhook('rawBody', 'signature')
    assert.deepEqual(result, payload)
    assert.isTrue(constructEventStub.calledOnce)
  })

  test('stripeWebhook - should throw StripeException when Stripe fails', async ({ assert }) => {
    const constructEventStub = sinon
      .stub(stripeApiClient['stripe'].webhooks, 'constructEvent')
      .throws(new Error('Invalid signature'))

    await assert.rejects(async () => {
      await stripeApiClient.stripeWebhook('rawBody', 'signature')
    }, StripeException.message)
    assert.isTrue(constructEventStub.calledOnce)
  })
})
