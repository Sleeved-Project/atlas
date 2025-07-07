import { ArtistFactory } from '#database/factories/artist'
import { RarityFactory } from '#database/factories/rarity'
import { SubtypeFactory } from '#database/factories/subtype'
import { TypeFactory } from '#database/factories/type'
import AuthServiceMock from '#tests/mocks/auth_service_mock'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import sinon from 'sinon'

test.group('Filters controller', (group) => {
  let wardenApiClientStub: sinon.SinonStub

  group.setup(() => {
    wardenApiClientStub = AuthServiceMock.setupWardenApiClientStub()
  })

  group.each.setup(() => testUtils.db().withGlobalTransaction())

  group.teardown(() => {
    wardenApiClientStub.restore()
  })

  test('cards - should return all filter types', async ({ client, assert }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await SubtypeFactory.create()
    await TypeFactory.create()

    const response = await client
      .get('/api/v1/filters/cards')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const result = response.body()

    assert.properties(result, ['artists', 'rarities', 'subtypes', 'types'])

    assert.isArray(result.artists)
    assert.isAtLeast(result.artists.length, 1)
    assert.isAtLeast(result.rarities.length, 1)
    assert.isAtLeast(result.subtypes.length, 1)
    assert.isAtLeast(result.types.length, 1)
  })

  test('cards - should return data with correct structure', async ({ client, assert }) => {
    await ArtistFactory.create()
    await RarityFactory.create()

    const response = await client
      .get('/api/v1/filters/cards')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const result = response.body()

    assert.property(result.artists[0], 'id')
    assert.property(result.artists[0], 'name')
    assert.isNumber(result.artists[0].id)
    assert.isString(result.artists[0].name)

    assert.property(result.rarities[0], 'id')
    assert.property(result.rarities[0], 'label')
    assert.isNumber(result.rarities[0].id)
    assert.isString(result.rarities[0].label)
  })

  test('cards - should respond quickly', async ({ client, assert }) => {
    await ArtistFactory.create()
    await RarityFactory.create()

    const start = Date.now()

    const response = await client
      .get('/api/v1/filters/cards')
      .header('Authorization', 'Bearer fake-token-for-testing')

    const duration = Date.now() - start

    response.assertStatus(200)
    assert.isBelow(duration, 1000)
  })
})
