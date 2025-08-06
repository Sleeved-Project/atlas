import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import sinon from 'sinon'
import AuthServiceMock, {
  TEST_AUTH_USER_ID,
  TEST_AUTH_USER_USERNAME,
} from '#tests/mocks/auth_service_mock'
import User from '#models/user'
import Folio from '#models/folio'

test.group('User controller', (group) => {
  let wardenApiClientStub: sinon.SinonStub

  group.setup(() => {
    wardenApiClientStub = AuthServiceMock.setupWardenApiClientStub()
  })

  group.each.setup(() => testUtils.db().withGlobalTransaction())

  group.teardown(() => {
    wardenApiClientStub.restore()
  })

  test('init - it should create a user and a main folio', async ({ client, assert }) => {
    const response = await client
      .post('/api/v1/user/init')
      .header('Authorization', 'Bearer fake-token-for-testing')

    console.log('Response status:', response.status())
    console.log('Response body:', JSON.stringify(response.body(), null, 2))

    response.assertStatus(201)

    assert.properties(response.body(), ['message'])
    assert.equal(
      response.body().message,
      `User ${TEST_AUTH_USER_USERNAME} with id ${TEST_AUTH_USER_ID} initialized successfully`
    )

    const user = await User.find(TEST_AUTH_USER_ID)
    assert.isNotNull(user)

    const mainFolio = await Folio.query()
      .where('userId', TEST_AUTH_USER_ID)
      .where('isRoot', true)
      .first()

    assert.isNotNull(mainFolio)
    assert.equal(mainFolio?.userId, TEST_AUTH_USER_ID)
  })

  test('init - it should not create duplicate user initialization', async ({ client, assert }) => {
    await User.create({
      id: TEST_AUTH_USER_ID,
      username: TEST_AUTH_USER_USERNAME,
    })

    const response = await client
      .post('/api/v1/user/init')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(409)
    assert.properties(response.body(), ['code', 'message'])
    assert.include(response.body().message, 'already initialized')
  })

  test('show - it should return user info by ID', async ({ client, assert }) => {
    await User.create({
      id: TEST_AUTH_USER_ID,
      username: TEST_AUTH_USER_USERNAME,
    })

    const response = await client
      .get(`/api/v1/user/${TEST_AUTH_USER_ID}`)
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)
    assert.equal(response.body().id, TEST_AUTH_USER_ID)
    assert.equal(response.body().username, TEST_AUTH_USER_USERNAME)
  })

  test('show - it should return 404 when user does not exist', async ({ client }) => {
    const response = await client
      .get('/api/v1/user/non-existent-id')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(404)
    response.assertBodyContains({
      code: 'E_ROW_NOT_FOUND',
    })
  })
})
