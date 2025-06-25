import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import sinon from 'sinon'
import { FolioFactory } from '#database/factories/folio'
import AuthServiceMock from '#tests/mocks/auth_service_mock'

test.group('Folio controller', (group) => {
  let wardenApiClientStub: sinon.SinonStub

  group.setup(() => {
    wardenApiClientStub = AuthServiceMock.setupWardenApiClientStub()
  })

  group.each.setup(() => testUtils.db().withGlobalTransaction())

  group.teardown(() => {
    wardenApiClientStub.restore()
  })

  test('init - it should create a main folio for a user', async ({ client, assert }) => {
    const response = await client
      .post('/api/v1/folios/init')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)
    assert.properties(response.body(), ['message'])
  })

  test('init - it should not create duplicate main folio', async ({ client, assert }) => {
    await FolioFactory.merge({
      userId: '123',
      isRoot: true,
    }).create()

    const response = await client
      .post('/api/v1/folios/init')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(409)
    assert.properties(response.body(), ['code', 'message'])
  })

  test('init - it should require authentication', async ({ client }) => {
    const response = await client.post('/api/v1/folios/init')
    response.assertStatus(401)
  })
})
