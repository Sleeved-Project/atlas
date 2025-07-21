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
    await ArtistFactory.merge([
      { id: 1, name: 'akagi' },
      { id: 2, name: 'rumplestiltskin' },
    ]).createMany(2)
    await RarityFactory.create()
    await SubtypeFactory.create()
    await TypeFactory.create()

    const response = await client
      .get(`/api/v1/filters/cards?page=1&limit=30&name=aka`)
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const result = response.body()

    assert.properties(result, ['paginatedArtists', 'rarities', 'subtypes', 'types'])

    assert.isArray(result.paginatedArtists.data)
    assert.isAtLeast(result.paginatedArtists.data.length, 1)
    assert.isAtLeast(result.rarities.length, 1)
    assert.isAtLeast(result.subtypes.length, 1)
    assert.isAtLeast(result.types.length, 1)
  })

  test('cards - should return data with correct structure', async ({ client, assert }) => {
    await ArtistFactory.create()
    await RarityFactory.create()

    const response = await client
      .get(`/api/v1/filters/cards?page=1&limit=10`)
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const result = response.body()

    assert.property(result.paginatedArtists.data[0], 'id')
    assert.property(result.paginatedArtists.data[0], 'value')
    assert.isNumber(result.paginatedArtists.data[0].id)
    assert.isString(result.paginatedArtists.data[0].value)

    assert.property(result.rarities[0], 'id')
    assert.property(result.rarities[0], 'value')
    assert.isNumber(result.rarities[0].id)
    assert.isString(result.rarities[0].value)
  })

  test('cards - should respond quickly', async ({ client, assert }) => {
    await ArtistFactory.create()
    await RarityFactory.create()

    const start = Date.now()

    const response = await client
      .get(`/api/v1/filters/cards?page=1&limit=10`)
      .header('Authorization', 'Bearer fake-token-for-testing')

    const duration = Date.now() - start

    response.assertStatus(200)
    assert.isBelow(duration, 1000)
  })
})
