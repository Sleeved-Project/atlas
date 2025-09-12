import { test } from '@japa/runner'
import sinon from 'sinon'
import PaymentService from '#services/payment_service'
import StripeApiClient from '#clients/stripe_api_client'

test.group('Payment service', (group) => {
  let createStripeAccountStub: sinon.SinonStub
  let linkStripeAccountStub: sinon.SinonStub

  group.each.setup(() => {
    createStripeAccountStub = sinon.stub(StripeApiClient.prototype, 'createStripeAccount')
    linkStripeAccountStub = sinon.stub(StripeApiClient.prototype, 'linkStripeAccount')
  })

  group.each.teardown(() => {
    createStripeAccountStub.restore()
    linkStripeAccountStub.restore()
  })

  test('createAccount - should create account and link successfully', async ({ assert }) => {
    createStripeAccountStub.resolves('acct_12345')
    linkStripeAccountStub.resolves({ url: 'https://stripe.com/linking-url' })

    const service = new PaymentService()
    const result = await service.createAccount()

    assert.deepEqual(result, {
      accountId: 'acct_12345',
      linkingUrl: 'https://stripe.com/linking-url',
    })

    assert.isTrue(createStripeAccountStub.calledOnce)
    assert.isTrue(
      linkStripeAccountStub.calledOnceWith(
        'acct_12345',
        `${process.env.ATLAS_BASE_URL}/payment/account/success`,
        `${process.env.ATLAS_BASE_URL}/payment/account/refresh`
      )
    )
  })

  test('createAccount - should throw if createStripeAccount fails', async ({ assert }) => {
    createStripeAccountStub.rejects(new Error('Stripe create error'))

    const service = new PaymentService()

    try {
      await service.createAccount()
      assert.fail('Expected createAccount to throw')
    } catch (err: any) {
      assert.isTrue(createStripeAccountStub.calledOnce)
      assert.isTrue(linkStripeAccountStub.notCalled)
      assert.include(err.message, 'Stripe create error')
    }
  })

  test('createAccount - should throw if linkStripeAccount fails', async ({ assert }) => {
    createStripeAccountStub.resolves('acct_12345')
    linkStripeAccountStub.rejects(new Error('Stripe link error'))

    const service = new PaymentService()

    try {
      await service.createAccount()
      assert.fail('Expected createAccount to throw')
    } catch (err: any) {
      assert.isTrue(createStripeAccountStub.calledOnce)
      assert.isTrue(linkStripeAccountStub.calledOnce)
      assert.include(err.message, 'Stripe link error')
    }
  })

  test('createPaymentSheet - should create payment sheet successfully', async ({ assert }) => {
    const paymentSheetResponse = {
      paymentIntentClientSecret: 'pi_12345',
      paymentIntentId: 'pi_12345',
      ephemeralKey: 'ek_12345',
      customer: 'cus_12345',
    }

    const createPaymentSheetStub = sinon
      .stub(StripeApiClient.prototype, 'createPaymentSheet')
      .resolves(paymentSheetResponse)

    const service = new PaymentService()
    const result = await service.createPaymentSheet()

    assert.deepEqual(result, paymentSheetResponse)
    assert.isTrue(createPaymentSheetStub.calledOnceWith())

    createPaymentSheetStub.restore()
  })

  test('createPaymentSheet - should throw if createPaymentSheet fails', async ({ assert }) => {
    const createPaymentSheetStub = sinon
      .stub(StripeApiClient.prototype, 'createPaymentSheet')
      .rejects(new Error('Stripe payment sheet error'))

    const service = new PaymentService()

    try {
      await service.createPaymentSheet()
      assert.fail('Expected createPaymentSheet to throw')
    } catch (err: any) {
      assert.isTrue(createPaymentSheetStub.calledOnceWith())
      assert.include(err.message, 'Stripe payment sheet error')
    }

    createPaymentSheetStub.restore()
  })
})
