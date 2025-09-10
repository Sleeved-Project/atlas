import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import sinon from 'sinon'
import { AdFactory } from '#database/factories/ad'
import AuthServiceMock from '#tests/mocks/auth_service_mock'

test.group('Ads controller', (group) => {
  let wardenApiClientStub: sinon.SinonStub

  group.setup(() => {
    wardenApiClientStub = AuthServiceMock.setupWardenApiClientStub()
  })

  group.each.setup(() => testUtils.db().withGlobalTransaction())

  group.teardown(() => {
    wardenApiClientStub.restore()
  })

  test('index - it should return paginated ads', async ({ client, assert }) => {
    await AdFactory.with('card')
      .with('seller')
      .with('condition')
      .with('finish')
      .with('status')
      .createMany(5)

    const response = await client
      .get('/api/v1/ads')
      .qs({ page: 1, limit: 3 })
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const body = response.body()
    assert.properties(body, ['meta', 'data'])
    assert.properties(body.meta, ['total', 'perPage', 'currentPage'])
    assert.equal(body.data.length, 3)
    assert.equal(body.meta.total, 5)
    assert.equal(body.meta.perPage, 3)
  })

  test('index - it should return ads with relationships', async ({ client, assert }) => {
    await AdFactory.with('card')
      .with('seller')
      .with('condition')
      .with('finish')
      .with('status')
      .create()

    const response = await client
      .get('/api/v1/ads')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const ad = response.body().data[0]
    assert.properties(ad, [
      'id',
      'originalPrice',
      'rectoImageUrl',
      'versoImageUrl',
      'card',
      'seller',
      'condition',
      'finish',
      'status',
      'createdAt',
    ])
  })

  test('index - it should validate pagination limits', async ({ client }) => {
    const response = await client
      .get('/api/v1/ads')
      .qs({ limit: 150 })
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(422)
  })

  test('index - it should require authentication', async ({ client }) => {
    const response = await client.get('/api/v1/ads')
    response.assertStatus(401)
  })
})
