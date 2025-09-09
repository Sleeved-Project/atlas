import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import sinon from 'sinon'
import AuthServiceMock, { TEST_AUTH_USER_ID } from '#tests/mocks/auth_service_mock'
import PaymentService from '#services/payment_service'
import UserService from '#services/user_service'
import { errors as lucidErrors } from '@adonisjs/lucid'
import { StripeException } from '#exceptions/payment_exception'

test.group('Payment controller', (group) => {
  let wardenApiClientStub: sinon.SinonStub
  let paymentServiceStub: sinon.SinonStub
  let userServiceStub: sinon.SinonStub

  group.setup(() => {
    wardenApiClientStub = AuthServiceMock.setupWardenApiClientStub()
    paymentServiceStub = sinon.stub(PaymentService.prototype, 'createAccount')
    userServiceStub = sinon.stub(UserService.prototype, 'updateUser')
  })

  group.each.setup(() => testUtils.db().withGlobalTransaction())

  group.teardown(() => {
    wardenApiClientStub.restore()
    paymentServiceStub.restore()
    userServiceStub.restore()
  })

  test('createAccount - should create Stripe account and update user', async ({
    client,
    assert,
  }) => {
    paymentServiceStub.resolves({
      linkingUrl: 'https://stripe.com/linking-url',
      accountId: 'acct_12345',
    })
    userServiceStub.resolves({ id: TEST_AUTH_USER_ID, stripeId: 'acct_12345' })

    const response = await client
      .get('/api/v1/payment/account')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)
    response.assertBodyContains({ linkingUrl: 'https://stripe.com/linking-url' })

    assert.isTrue(paymentServiceStub.calledOnce)
    assert.isTrue(userServiceStub.calledWith(TEST_AUTH_USER_ID, { stripeId: 'acct_12345' }))
  })

  test('createAccount - should return 404 if user is not found', async ({ client }) => {
    paymentServiceStub.resolves({
      linkingUrl: 'https://stripe.com/linking-url',
      accountId: 'acct_12345',
    })
    userServiceStub.rejects(new lucidErrors.E_ROW_NOT_FOUND())

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
    userServiceStub.resolves() // not called

    const response = await client
      .get('/api/v1/payment/account')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(500)

    const body = response.body()
    assert.equal(body.message, 'Unknown error occured with Stripe')
    assert.equal(body.code, 'E_STRIPE_EXCEPTION')
  })
})
