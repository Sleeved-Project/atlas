import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import sinon from 'sinon'
import AuthServiceMock from '#tests/mocks/auth_service_mock'
import { CardConditionFactory } from '#database/factories/card_condition'

test.group('Card conditions controller', (group) => {
  let wardenApiClientStub: sinon.SinonStub

  group.setup(() => {
    wardenApiClientStub = AuthServiceMock.setupWardenApiClientStub()
  })

  group.each.setup(() => testUtils.db().withGlobalTransaction())

  group.teardown(() => {
    wardenApiClientStub.restore()
  })

  test('index - it should return all card conditions', async ({ client, assert }) => {
    await CardConditionFactory.createMany(5)

    const response = await client
      .get('/api/v1/cards/conditions')
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
      .get('/api/v1/cards/conditions')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const body = response.body()
    assert.isArray(body)
    assert.equal(body.length, 0)
  })

  test('index - it should return card conditions with correct structure', async ({
    client,
    assert,
  }) => {
    const cardCondition = await CardConditionFactory.merge({
      label: 'Good condition',
    }).create()

    const response = await client
      .get('/api/v1/cards/conditions')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const body = response.body()
    assert.equal(body.length, 1)

    const condition = body[0]
    assert.equal(condition.id, cardCondition.id)
    assert.equal(condition.label, 'Good condition')
    assert.properties(condition, ['id', 'label'])
  })

  test('index - it should handle authentication requirement', async ({ client }) => {
    await CardConditionFactory.createMany(3)

    const response = await client.get('/api/v1/cards/conditions')

    response.assertStatus(401)
  })
})
