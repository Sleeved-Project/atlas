import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import sinon from 'sinon'
import AuthServiceMock, {
  TEST_AUTH_USER_ID,
  TEST_AUTH_USER_USERNAME,
} from '#tests/mocks/auth_service_mock'
import User from '#models/user'
import Folio from '#models/folio'
import { UserFactory } from '#database/factories/user'

test.group('User controller', (group) => {
  let wardenApiClientStub: sinon.SinonStub

  group.setup(() => {
    wardenApiClientStub = AuthServiceMock.setupWardenApiClientStub()
  })

  group.each.setup(async () => {
    await testUtils.db().withGlobalTransaction()
    await User.query().delete()
    await User.query().where('id', TEST_AUTH_USER_ID).delete()
  })

  group.teardown(() => {
    wardenApiClientStub.restore()
  })

  test('init - it should create a user and a main folio', async ({ client, assert }) => {
    const response = await client
      .post('/api/v1/me/init')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(201)
    assert.properties(response.body(), ['message'])
    assert.equal(
      response.body().message,
      `User ${TEST_AUTH_USER_USERNAME} with id ${TEST_AUTH_USER_ID} initialized successfully`
    )

    const user = await User.find(TEST_AUTH_USER_ID)
    assert.isNotNull(user)
    assert.equal(user?.username, TEST_AUTH_USER_USERNAME)

    const mainFolio = await Folio.query()
      .where('userId', TEST_AUTH_USER_ID)
      .where('isRoot', true)
      .first()

    assert.isNotNull(mainFolio)
    assert.equal(mainFolio?.userId, TEST_AUTH_USER_ID)
    assert.equal(mainFolio?.isRoot, 1)
  })

  test('init - it should not create duplicate user initialization', async ({ client, assert }) => {
    await UserFactory.merge({
      id: TEST_AUTH_USER_ID,
      username: TEST_AUTH_USER_USERNAME,
    }).create()

    const response = await client
      .post('/api/v1/me/init')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(409)
    assert.properties(response.body(), ['code', 'message'])
    assert.include(response.body().message, 'already initialized')
  })

  test('show - it should return user info by ID', async ({ client, assert }) => {
    await UserFactory.merge({
      id: TEST_AUTH_USER_ID,
      username: TEST_AUTH_USER_USERNAME,
      firstname: 'John',
      lastname: 'Doe',
      phone: '+33612345678',
      description: 'Test user profile',
      profilePictureUrl: 'https://example.com/avatar.jpg',
    }).create()

    const response = await client
      .get(`/api/v1/me`)
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)
    assert.equal(response.body().id, TEST_AUTH_USER_ID)
    assert.equal(response.body().username, TEST_AUTH_USER_USERNAME)
    assert.equal(response.body().firstname, 'John')
    assert.equal(response.body().lastname, 'Doe')
    assert.equal(response.body().phone, '+33612345678')
    assert.equal(response.body().description, 'Test user profile')
    assert.equal(response.body().profilePictureUrl, 'https://example.com/avatar.jpg')
  })

  test('show - it should return 404 when user does not exist', async ({ client }) => {
    const response = await client
      .get('/api/v1/me')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(404)
    response.assertBodyContains({
      code: 'E_ROW_NOT_FOUND',
    })
  })

  test('update - it should update user profile', async ({ client, assert }) => {
    await UserFactory.merge({
      id: TEST_AUTH_USER_ID,
      username: TEST_AUTH_USER_USERNAME,
      firstname: 'Initial',
      lastname: 'User',
    }).create()

    const updateData = {
      firstname: 'John',
      lastname: 'Doe',
      phone: '+33612345678',
      description: 'Pokemon card collector since 1999',
      profilePictureUrl: 'https://example.com/profile.jpg',
    }

    const response = await client
      .patch(`/api/v1/me`)
      .header('Authorization', 'Bearer fake-token-for-testing')
      .json(updateData)

    response.assertStatus(200)
    assert.equal(response.body().id, TEST_AUTH_USER_ID)
    assert.equal(response.body().username, TEST_AUTH_USER_USERNAME)
    assert.equal(response.body().firstname, updateData.firstname)
    assert.equal(response.body().lastname, updateData.lastname)
    assert.equal(response.body().phone, updateData.phone)
    assert.equal(response.body().description, updateData.description)
    assert.equal(response.body().profilePictureUrl, updateData.profilePictureUrl)

    const updatedUser = await User.findOrFail(TEST_AUTH_USER_ID)
    assert.equal(updatedUser.firstname, updateData.firstname)
  })

  test('update - it should handle partial updates', async ({ client, assert }) => {
    await UserFactory.merge({
      id: TEST_AUTH_USER_ID,
      username: TEST_AUTH_USER_USERNAME,
      firstname: 'Initial',
      lastname: 'User',
      description: 'Initial description',
      phone: '+33612345678',
    }).create()

    const updateData = {
      firstname: 'Updated',
      lastname: '',
      phone: '',
      description: '',
      profilePictureUrl: 'https://example.com/new-avatar.jpg',
    }

    const response = await client
      .patch(`/api/v1/me`)
      .header('Authorization', 'Bearer fake-token-for-testing')
      .json(updateData)

    response.assertStatus(200)
    assert.equal(response.body().firstname, 'Updated')
    assert.equal(response.body().lastname, null)
    assert.equal(response.body().description, null)
    assert.equal(response.body().phone, null)
    assert.equal(response.body().profilePictureUrl, 'https://example.com/new-avatar.jpg')
  })

  test('update - it should require authentication', async ({ client }) => {
    const response = await client.patch(`/api/v1/me`).json({ firstname: 'John' })
    response.assertStatus(401)
  })

  test('update - it should return validation error for invalid data', async ({ client }) => {
    await UserFactory.merge({
      id: TEST_AUTH_USER_ID,
      username: TEST_AUTH_USER_USERNAME,
    }).create()

    const response = await client
      .patch(`/api/v1/me`)
      .header('Authorization', 'Bearer fake-token-for-testing')
      .json({
        firstname: 'A'.repeat(100),
      })

    response.assertStatus(422)
    response.assertBodyContains({
      code: 'E_VALIDATION_ERROR',
    })
  })

  test('hasValidStripeAccount - it should return true if user has a Stripe account', async ({
    client,
    assert,
  }) => {
    await UserFactory.merge({
      id: TEST_AUTH_USER_ID,
      username: TEST_AUTH_USER_USERNAME,
      firstname: 'John',
      lastname: 'Doe',
      phone: '+33612345678',
      description: 'Test user profile',
      profilePictureUrl: 'https://example.com/avatar.jpg',
      stripeId: 'acct_123456789',
    }).create()

    const response = await client
      .get(`/api/v1/me/stripe`)
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)
    assert.isTrue(response.body().hasValidStripeAccount)
  })

  test('hasValidStripeAccount - it should return false if user does not have a Stripe account', async ({
    client,
    assert,
  }) => {
    await UserFactory.merge({
      id: TEST_AUTH_USER_ID,
      username: TEST_AUTH_USER_USERNAME,
      firstname: 'John',
      lastname: 'Doe',
      phone: '+33612345678',
      description: 'Test user profile',
      profilePictureUrl: 'https://example.com/avatar.jpg',
      stripeId: null,
    }).create()

    const response = await client
      .get(`/api/v1/me/stripe`)
      .header('Authorization', 'Bearer fake-token-for-testing')
    response.assertStatus(200)
    assert.isFalse(response.body().hasValidStripeAccount)
  })

  test('tokens - it should return remaining grading tokens count', async ({ client, assert }) => {
    await UserFactory.merge({
      id: TEST_AUTH_USER_ID,
      username: TEST_AUTH_USER_USERNAME,
      remainingCertificateToken: 5,
    }).create()

    const response = await client
      .get(`/api/v1/me/tokens`)
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)
    assert.properties(response.body(), ['remainingCertificateToken'])
    assert.equal(response.body().remainingCertificateToken, 5)
  })

  test('tokens - it should return 404 when user does not exist', async ({ client }) => {
    const response = await client
      .get('/api/v1/me/tokens')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(404)
    response.assertBodyContains({
      code: 'E_ROW_NOT_FOUND',
    })
  })

  test('tokens - it should require authentication', async ({ client }) => {
    const response = await client.get('/api/v1/me/tokens')

    response.assertStatus(401)
  })
})
