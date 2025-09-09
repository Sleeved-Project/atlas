import { UserFactory } from '#database/factories/user'
import User from '#models/user'
import AuthServiceMock from '#tests/mocks/auth_service_mock'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import sinon from 'sinon'

test.group('Users controller', (group) => {
  let wardenApiClientStub: sinon.SinonStub

  group.setup(() => {
    wardenApiClientStub = AuthServiceMock.setupWardenApiClientStub()
  })

  group.each.setup(async () => {
    await testUtils.db().withGlobalTransaction()
    await User.query().delete()
  })

  group.teardown(() => {
    wardenApiClientStub.restore()
  })

  test('search - it should return paginated users', async ({ client, assert }) => {
    // Create test users
    await UserFactory.merge({ username: 'john_doe' }).create()
    await UserFactory.merge({ username: 'jane_doe' }).create()
    await UserFactory.merge({ username: 'bob_smith' }).create()

    const response = await client
      .get('/api/v1/users')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)
    assert.properties(response.body(), ['data', 'meta'])
    assert.isArray(response.body().data)
    assert.equal(response.body().data.length, 3)
    assert.properties(response.body().meta, ['total', 'perPage', 'currentPage'])
  })

  test('search - it should filter users by username', async ({ client, assert }) => {
    await UserFactory.merge({ username: 'john_doe' }).create()
    await UserFactory.merge({ username: 'jane_doe' }).create()
    await UserFactory.merge({ username: 'bob_smith' }).create()

    const response = await client
      .get('/api/v1/users')
      .qs({ username: 'doe' })
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)
    assert.equal(response.body().data.length, 2)
    assert.include(
      response.body().data.map((u: any) => u.username),
      'john_doe'
    )
    assert.include(
      response.body().data.map((u: any) => u.username),
      'jane_doe'
    )
  })

  test('search - it should handle pagination parameters', async ({ client, assert }) => {
    await UserFactory.createMany(5)

    const response = await client
      .get('/api/v1/users')
      .qs({ page: 1, limit: 2 })
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)
    assert.equal(response.body().data.length, 2)
    assert.equal(response.body().meta.perPage, 2)
    assert.equal(response.body().meta.currentPage, 1)
    assert.equal(response.body().meta.total, 5)
  })

  test('search - it should validate pagination limits', async ({ client }) => {
    const response = await client
      .get('/api/v1/users')
      .qs({ limit: 150 })
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(422)
    response.assertBodyContains({
      code: 'E_VALIDATION_ERROR',
    })
  })

  test('search - it should require authentication', async ({ client }) => {
    const response = await client.get('/api/v1/users')
    response.assertStatus(401)
  })

  test('show - it should return user by ID', async ({ client, assert }) => {
    const user = await UserFactory.merge({
      username: 'john_doe',
      firstname: 'John',
      lastname: 'Doe',
      profilePictureUrl: 'https://example.com/avatar.jpg',
      description: 'Test user',
    }).create()

    const response = await client
      .get(`/api/v1/users/${user.id}`)
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)
    assert.equal(response.body().id, user.id)
    assert.equal(response.body().username, 'john_doe')
    assert.equal(response.body().firstname, 'John')
    assert.equal(response.body().lastname, 'Doe')
    assert.equal(response.body().profilePictureUrl, 'https://example.com/avatar.jpg')
    assert.equal(response.body().description, 'Test user')
    assert.property(response.body(), 'createdAt')
  })

  test('show - it should return 404 for non-existent user', async ({ client }) => {
    const response = await client
      .get('/api/v1/users/123e4567-e89b-12d3-a456-426614174000')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(404)
    response.assertBodyContains({
      code: 'E_ROW_NOT_FOUND',
    })
  })

  test('show - it should validate UUID format', async ({ client }) => {
    const response = await client
      .get('/api/v1/users/invalid-id')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(422)
    response.assertBodyContains({
      code: 'E_VALIDATION_ERROR',
    })
  })

  test('show - it should require authentication', async ({ client }) => {
    const response = await client.get('/api/v1/users/123e4567-e89b-12d3-a456-426614174000')
    response.assertStatus(401)
  })

  test('show - it should not expose sensitive user data', async ({ client, assert }) => {
    const user = await UserFactory.merge({
      username: 'john_doe',
      phone: '+33612345678',
    }).create()

    const response = await client
      .get(`/api/v1/users/${user.id}`)
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)
    assert.notProperty(response.body(), 'phone')
    assert.notProperty(response.body(), 'updatedAt')
  })
})
