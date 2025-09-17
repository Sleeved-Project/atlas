// import { test } from '@japa/runner'
// import sinon from 'sinon'
// import StripeApiClient from '#clients/stripe_api_client'
// import { StripeException } from '#exceptions/payment_exception'

// test.group('StripeApiClient', (group) => {
//   let stripeApiClient: StripeApiClient
//   let accountsStub: any
//   let accountLinksStub: any
//   let customer: any
//   let ephemeralKey: any
//   let paymentIntent: any

//   group.each.setup(() => {
//     stripeApiClient = new StripeApiClient()

//     // Stub Stripe SDK methods
//     accountsStub = sinon.stub(stripeApiClient['stripe'].accounts, 'create')
//     accountLinksStub = sinon.stub(stripeApiClient['stripe'].accountLinks, 'create')
//     customer = sinon.stub(stripeApiClient['stripe'].customers, 'create')
//     ephemeralKey = sinon.stub(stripeApiClient['stripe'].ephemeralKeys, 'create')
//     paymentIntent = sinon.stub(stripeApiClient['stripe'].paymentIntents, 'create')
//     sinon.stub(stripeApiClient['stripe'].accounts, 'del')
//   })

//   group.each.teardown(() => {
//     sinon.restore()
//   })

//   test('createStripeAccount - should return account id when successful', async ({ assert }) => {
//     accountsStub.resolves({ id: 'acct_123' })

//     const result = await stripeApiClient.createStripeAccount()
//     assert.equal(result, 'acct_123')
//   })

//   test('createStripeAccount - should throw StripeException when Stripe fails', async ({
//     assert,
//   }) => {
//     accountsStub.rejects(new Error('Stripe down'))

//     await assert.rejects(async () => {
//       await stripeApiClient.createStripeAccount()
//     }, StripeException.message)
//   })

//   test('linkStripeAccount - should return account link when successful', async ({ assert }) => {
//     accountLinksStub.resolves({ url: 'https://stripe.com/link' })

//     const result = await stripeApiClient.linkStripeAccount(
//       'acct_123',
//       'https://return',
//       'https://refresh'
//     )
//     assert.deepEqual(result, { url: 'https://stripe.com/link' })
//   })

//   test('linkStripeAccount - should throw StripeException when Stripe fails', async ({ assert }) => {
//     accountLinksStub.rejects(new Error('Bad request'))

//     await assert.rejects(async () => {
//       await stripeApiClient.linkStripeAccount('acct_123', 'https://return', 'https://refresh')
//     }, StripeException.message)
//   })

//   test('deleteStripeAccount - should return account id when successful', async ({ assert }) => {
//     const deleteStub = stripeApiClient['stripe'].accounts.del as sinon.SinonStub
//     deleteStub.resolves({ id: 'acct_123' })

//     const result = await stripeApiClient.deleteStripeAccount('acct_123')
//     assert.equal(result, 'acct_123')
//   })

//   test('deleteStripeAccount - should throw StripeException when Stripe fails', async ({
//     assert,
//   }) => {
//     const deleteStub = stripeApiClient['stripe'].accounts.del as sinon.SinonStub
//     deleteStub.rejects(new Error('Stripe delete error'))

//     await assert.rejects(async () => {
//       await stripeApiClient.deleteStripeAccount('acct_123')
//     }, StripeException.message)
//   })

//   test('createPaymentSheet - should create payment sheet with existing customer', async ({
//     assert,
//   }) => {
//     const existingCustomerId = 'cus_existing'
//     const paymentIntentId = 'pi_test123'
//     const ephemeralKeySecret = 'ek_test123'
//     const clientSecret = 'pi_test123_secret'

//     // Utilisation des stubs existants
//     ephemeralKey.resolves({ secret: ephemeralKeySecret })
//     paymentIntent.resolves({
//       id: paymentIntentId,
//       client_secret: clientSecret,
//     })

//     const result = await stripeApiClient.createPaymentSheet(1000, existingCustomerId)

//     assert.equal(result.customer, existingCustomerId)
//     assert.equal(result.paymentIntentId, paymentIntentId)
//     assert.equal(result.paymentIntentClientSecret, clientSecret)
//     assert.equal(result.ephemeralKey, ephemeralKeySecret)

//     assert.isFalse(customer.called)
//     assert.isTrue(
//       ephemeralKey.calledWith({ customer: existingCustomerId }, { apiVersion: '2024-06-20' })
//     )
//     assert.isTrue(
//       paymentIntent.calledWith({
//         amount: 1000,
//         currency: 'eur',
//         customer: existingCustomerId,
//         automatic_payment_methods: { enabled: true },
//       })
//     )
//   })

//   test('createPaymentSheet - should create payment sheet with new customer', async ({ assert }) => {
//     const newCustomerId = 'cus_new'
//     const paymentIntentId = 'pi_test123'
//     const ephemeralKeySecret = 'ek_test123'
//     const clientSecret = 'pi_test123_secret'

//     // Utilisation des stubs existants
//     customer.resolves({ id: newCustomerId })
//     ephemeralKey.resolves({ secret: ephemeralKeySecret })
//     paymentIntent.resolves({
//       id: paymentIntentId,
//       client_secret: clientSecret,
//     })

//     const result = await stripeApiClient.createPaymentSheet(1000, null)

//     assert.equal(result.customer, newCustomerId)
//     assert.equal(result.paymentIntentId, paymentIntentId)
//     assert.equal(result.paymentIntentClientSecret, clientSecret)
//     assert.equal(result.ephemeralKey, ephemeralKeySecret)

//     assert.isTrue(customer.calledOnce)
//     assert.isTrue(
//       ephemeralKey.calledWith({ customer: newCustomerId }, { apiVersion: '2024-06-20' })
//     )
//     assert.isTrue(
//       paymentIntent.calledWith({
//         amount: 1000,
//         currency: 'eur',
//         customer: newCustomerId,
//         automatic_payment_methods: { enabled: true },
//       })
//     )
//   })

//   test('createPaymentSheet - should throw StripeException on error', async ({ assert }) => {
//     // Utilisation du stub existant
//     customer.rejects(new Error('Stripe API error'))

//     await assert.rejects(
//       () => stripeApiClient.createPaymentSheet(1000, null),
//       'Unknown error occured with Stripe'
//     )
//   })
//   test('stripeWebhook - should return void when successful', async ({ assert }) => {
//     const payload = { id: 'evt_123', type: 'payment_intent.succeeded' }

//     const constructEventStub = sinon
//       .stub(stripeApiClient['stripe'].webhooks, 'constructEvent')
//       .returns(payload as any)

//     const result = await stripeApiClient.stripeWebhook('rawBody', 'signature')
//     assert.deepEqual(result, payload)
//     assert.isTrue(constructEventStub.calledOnce)
//   })

//   test('stripeWebhook - should throw StripeException when Stripe fails', async ({ assert }) => {
//     const constructEventStub = sinon
//       .stub(stripeApiClient['stripe'].webhooks, 'constructEvent')
//       .throws(new Error('Invalid signature'))

//     await assert.rejects(async () => {
//       await stripeApiClient.stripeWebhook('rawBody', 'signature')
//     }, StripeException.message)
//     assert.isTrue(constructEventStub.calledOnce)
//   })
// })
