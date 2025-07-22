import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import sinon from 'sinon'
import AuthServiceMock from '#tests/mocks/auth_service_mock'
import { SetFactory } from '#database/factories/set'
import { ArtistFactory } from '#database/factories/artist'
import { RarityFactory } from '#database/factories/rarity'
import { LegalityFactory } from '#database/factories/legality'
import { CardFactory } from '#database/factories/card'

test.group('Set controller', (group) => {
  let wardenApiClientStub: sinon.SinonStub

  group.setup(() => {
    wardenApiClientStub = AuthServiceMock.setupWardenApiClientStub()
  })

  group.each.setup(() => testUtils.db().withGlobalTransaction())

  group.teardown(() => {
    wardenApiClientStub.restore()
  })

  test('index - it should return paginated sets', async ({ client, assert }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.createMany(15)

    const response = await client
      .get('/api/v1/sets')
      .qs({ page: 1, limit: 10 })
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const body = response.body()
    assert.properties(body, ['meta', 'data'])

    assert.properties(body.meta, ['total', 'perPage', 'currentPage', 'lastPage'])

    assert.equal(body.data.length, 10)

    const firstSet = body.data[0]

    assert.properties(firstSet, ['id', 'imageSymbol', 'imageLogo', 'total', 'nbOwned'])
  })

  test('index - it should apply pagination correctly', async ({ client, assert }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.createMany(15)

    const response1 = await client
      .get('/api/v1/sets')
      .qs({ page: 1, limit: 5 })
      .header('Authorization', 'Bearer fake-token-for-testing')

    response1.assertStatus(200)
    const page1Data = response1.body().data

    const response2 = await client
      .get('/api/v1/sets')
      .qs({ page: 2, limit: 5 })
      .header('Authorization', 'Bearer fake-token-for-testing')
    response2.assertStatus(200)
    const page2Data = response2.body().data

    assert.notEqual(page1Data[0].id, page2Data[0].id)

    assert.equal(page1Data.length, 5)
    assert.equal(page2Data.length, 5)
  })

  test('index - it should handle invalid pagination parameters', async ({ client }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.createMany(15)

    const responseNegativePage = await client
      .get('/api/v1/sets')
      .qs({ page: -1, limit: 10 })
      .header('Authorization', 'Bearer fake-token-for-testing')

    responseNegativePage.assertStatus(422)

    const responseNegativeLimit = await client
      .get('/api/v1/sets')
      .qs({ page: 1, limit: -5 })
      .header('Authorization', 'Bearer fake-token-for-testing')

    responseNegativeLimit.assertStatus(422)

    const responseInvalidParams = await client
      .get('/api/v1/sets')
      .qs({ page: 'abc', limit: 'xyz' })
      .header('Authorization', 'Bearer fake-token-for-testing')
    responseInvalidParams.assertStatus(422)
  })

  test('index - it should handle invalid filters params', async ({ client, assert }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.createMany(15)

    const responseNotExistingFilter = await client
      .get('/api/v1/sets')
      .qs({ page: 1, limit: 10, names: 'Pikachu' })
      .header('Authorization', 'Bearer fake-token-for-testing')

    responseNotExistingFilter.assertStatus(200)
    assert.isAtLeast(responseNotExistingFilter.body().data.length, 1)

    const responseEmptyFilter = await client
      .get('/api/v1/sets')
      .qs({ page: 1, limit: 10, name: '' })
      .header('Authorization', 'Bearer fake-token-for-testing')

    responseEmptyFilter.assertStatus(200)
    assert.equal(responseEmptyFilter.body().data.length, 10)

    const responseNotExistingName = await client
      .get('/api/v1/sets')
      .qs({ page: 1, limit: 10, name: '123QS' })
      .header('Authorization', 'Bearer fake-token-for-testing')

    responseNotExistingName.assertStatus(200)
    assert.isEmpty(responseNotExistingName.body().data)
  })

  test('index - it should return 200 and empty page for non-existent page', async ({
    client,
    assert,
  }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.createMany(15)

    const response = await client
      .get('/api/v1/sets')
      .qs({ page: 99999, limit: 10 })
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)
    assert.isEmpty(response.body().data)
  })

  test('details - it should return a single set details by id', async ({ client, assert }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.merge({ id: 'base1' }).create()

    const response = await client
      .get('/api/v1/sets/base1/details')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const set = response.body()

    assert.equal(set.id, 'base1')
    assert.properties(set, ['id', 'name', 'releaseDate', 'imageSymbol', 'imageLogo', 'total'])
  })

  test('details - it should return 404 for non-existent set', async ({ client }) => {
    const response = await client
      .get('/api/v1/sets/non-existent-/details')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(404)

    response.assertBodyContains({
      message: 'Set not found',
      code: 'E_ROW_NOT_FOUND',
    })
  })

  test('cards - it should return cards for a set', async ({ client, assert }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.merge({ id: 'base1' }).create()

    await CardFactory.createMany(15)

    const response = await client
      .get('/api/v1/sets/base1/cards')
      .qs({ page: 1, limit: 10 })
      .header('Authorization', 'Bearer fake-token-for-testing')

    const body = response.body()
    assert.properties(body, ['meta', 'data'])

    assert.properties(body.meta, [
      'total',
      'perPage',
      'currentPage',
      'lastPage',
      'firstPage',
      'firstPageUrl',
      'lastPageUrl',
      'nextPageUrl',
      'previousPageUrl',
    ])

    assert.equal(body.data.length, 10)

    const firstCard = body.data[0]
    assert.properties(firstCard, ['id', 'imageSmall'])
  })
  test('cards - it should return filtered cards for a set', async ({ client, assert }) => {
    await ArtistFactory.create()
    await RarityFactory.merge({ id: 1, label: 'Common' }).create()
    await RarityFactory.merge({ id: 2, label: 'Rare' }).create()
    await RarityFactory.merge({ id: 3, label: 'Not That Great Honestly' }).create()
    await LegalityFactory.create()
    await SetFactory.merge({ id: 'base1' }).create()

    await CardFactory.merge([
      { rarityId: 1 },
      { rarityId: 2 },
      { rarityId: 2 },
      { rarityId: 2 },
      { rarityId: 3 },
    ]).createMany(5)

    const response = await client
      .get('/api/v1/sets/base1/cards')
      .qs({ page: 1, limit: 10, rarities: [1, 3] })
      .header('Authorization', 'Bearer fake-token-for-testing')

    const body = response.body()
    assert.properties(body, ['meta', 'data'])

    assert.properties(body.meta, [
      'total',
      'perPage',
      'currentPage',
      'lastPage',
      'firstPage',
      'firstPageUrl',
      'lastPageUrl',
      'nextPageUrl',
      'previousPageUrl',
    ])

    assert.equal(body.data.length, 2)

    const firstCard = body.data[0]
    assert.properties(firstCard, ['id', 'imageSmall'])
  })
})
