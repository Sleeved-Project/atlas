import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import sinon from 'sinon'
import AuthServiceMock from '#tests/mocks/auth_service_mock'
import { CardFinishFactory } from '#database/factories/card_finish'

test.group('Card finishes controller', (group) => {
  let wardenApiClientStub: sinon.SinonStub

  group.setup(() => {
    wardenApiClientStub = AuthServiceMock.setupWardenApiClientStub()
  })

  group.each.setup(() => testUtils.db().withGlobalTransaction())

  group.teardown(() => {
    wardenApiClientStub.restore()
  })

  test('index - it should return all card finishes', async ({ client, assert }) => {
    await CardFinishFactory.createMany(5)

    const response = await client
      .get('/api/v1/cards/finishes')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const body = response.body()
    assert.isArray(body)
    assert.equal(body.length, 5)

    const firstCondition = body[0]
    assert.properties(firstCondition, ['id', 'label'])
  })

  test('index - it should return empty array when no card conditions exist', async ({
    client,
    assert,
  }) => {
    const response = await client
      .get('/api/v1/cards/finishes')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const body = response.body()
    assert.isArray(body)
    assert.equal(body.length, 0)
  })

  test('index - it should return card finishes with correct structure', async ({
    client,
    assert,
  }) => {
    const cardFinish = await CardFinishFactory.merge({
      label: 'Holofoil',
    }).create()

    const response = await client
      .get('/api/v1/cards/finishes')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const body = response.body()
    assert.equal(body.length, 1)

    const finish = body[0]
    assert.equal(finish.id, cardFinish.id)
    assert.equal(finish.label, 'Holofoil')
    assert.properties(finish, ['id', 'label'])
  })

  test('index - it should handle authentication requirement', async ({ client }) => {
    await CardFinishFactory.createMany(3)

    const response = await client.get('/api/v1/cards/finishes')

    response.assertStatus(401)
  })
})
