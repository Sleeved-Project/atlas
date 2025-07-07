import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import sinon from 'sinon'
import { CardFactory } from '#database/factories/card'
import AuthServiceMock, { TEST_AUTH_USER_ID } from '#tests/mocks/auth_service_mock'
import { ArtistFactory } from '#database/factories/artist'
import { RarityFactory } from '#database/factories/rarity'
import { LegalityFactory } from '#database/factories/legality'
import { SetFactory } from '#database/factories/set'
import { SubtypeFactory } from '#database/factories/subtype'
import { TypeFactory } from '#database/factories/type'
import { FolioFactory } from '#database/factories/folio'
import { CardFolioFactory } from '#database/factories/card_folio'

test.group('Card controller', (group) => {
  let wardenApiClientStub: sinon.SinonStub

  group.setup(() => {
    wardenApiClientStub = AuthServiceMock.setupWardenApiClientStub()
  })

  group.each.setup(() => testUtils.db().withGlobalTransaction())

  group.teardown(() => {
    wardenApiClientStub.restore()
  })

  test('index - it should return paginated cards', async ({ client, assert }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()
    await CardFactory.createMany(15)

    const response = await client
      .get('/api/v1/cards')
      .qs({ page: 1, limit: 10 })
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

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

  test('index - it should apply pagination correctly', async ({ client, assert }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()
    await CardFactory.createMany(15)

    const response1 = await client
      .get('/api/v1/cards')
      .qs({ page: 1, limit: 5 })
      .header('Authorization', 'Bearer fake-token-for-testing')

    response1.assertStatus(200)
    const page1Data = response1.body().data

    const response2 = await client
      .get('/api/v1/cards')
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
    await SetFactory.create()
    await CardFactory.createMany(15)

    const responseNegativePage = await client
      .get('/api/v1/cards')
      .qs({ page: -1, limit: 10 })
      .header('Authorization', 'Bearer fake-token-for-testing')

    responseNegativePage.assertStatus(422)

    const responseNegativeLimit = await client
      .get('/api/v1/cards')
      .qs({ page: 1, limit: -5 })
      .header('Authorization', 'Bearer fake-token-for-testing')

    responseNegativeLimit.assertStatus(422)

    const responseInvalidParams = await client
      .get('/api/v1/cards')
      .qs({ page: 'abc', limit: 'xyz' })
      .header('Authorization', 'Bearer fake-token-for-testing')
    responseInvalidParams.assertStatus(422)
  })

  test('index - it should handle invalid filters params', async ({ client, assert }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()
    await CardFactory.createMany(15)

    const responseNotExistingFilter = await client
      .get('/api/v1/cards')
      .qs({ page: 1, limit: 10, names: 'Pikachu' })
      .header('Authorization', 'Bearer fake-token-for-testing')

    responseNotExistingFilter.assertStatus(200)
    assert.isAtLeast(responseNotExistingFilter.body().data.length, 1)

    const responseEmptyFilter = await client
      .get('/api/v1/cards')
      .qs({ page: 1, limit: 10, name: '' })
      .header('Authorization', 'Bearer fake-token-for-testing')

    responseEmptyFilter.assertStatus(200)
    assert.equal(responseEmptyFilter.body().data.length, 10)

    const responseNotExistingName = await client
      .get('/api/v1/cards')
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
    await SetFactory.create()
    await CardFactory.createMany(15)

    const response = await client
      .get('/api/v1/cards')
      .qs({ page: 99999, limit: 10 })
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)
    assert.isEmpty(response.body().data)
  })

  test('index - it should filter by name when name parameter is provided', async ({
    client,
    assert,
  }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()

    const pikachuCard = await CardFactory.merge({ name: 'Pikachu' }).create()
    await CardFactory.merge({ name: 'Charizard' }).create()
    await CardFactory.merge({ name: 'Bulbasaur' }).create()

    const response = await client
      .get('/api/v1/cards')
      .qs({ page: 1, limit: 10, name: 'Pika' })
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const body = response.body()
    assert.equal(body.data.length, 1)
    assert.equal(body.data[0].id, pikachuCard.id)
    assert.equal(body.meta.total, 1)
  })

  test('index - it should filter by rarity when rarity parameter is provided', async ({
    client,
    assert,
  }) => {
    await LegalityFactory.create()
    await SetFactory.create()

    const commonRarity = await RarityFactory.merge({ id: 1, label: 'Common' }).create()
    const rareRarity = await RarityFactory.merge({ id: 2, label: 'Rare' }).create()
    const artist = await ArtistFactory.create()

    const commonCard = await CardFactory.merge({
      name: 'Common Card',
      rarityId: commonRarity.id,
      artistId: artist.id,
    }).create()

    await CardFactory.merge({
      name: 'Rare Card',
      rarityId: rareRarity.id,
      artistId: artist.id,
    }).create()

    const response = await client
      .get(`/api/v1/cards?page=1&limit=10&rarity[]=${commonRarity.id}`)
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const body = response.body()
    assert.equal(body.data.length, 1)
    assert.equal(body.data[0].id, commonCard.id)
    assert.equal(body.meta.total, 1)
  })

  test('index - it should filter by artist when artist parameter is provided', async ({
    client,
    assert,
  }) => {
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()

    const artist1 = await ArtistFactory.merge({ id: 1, name: 'Artist One' }).create()
    const artist2 = await ArtistFactory.merge({ id: 2, name: 'Artist Two' }).create()

    const atist1Card = await CardFactory.merge({
      name: 'Card by Artist One',
      artistId: artist1.id,
    }).create()

    await CardFactory.merge({
      name: 'Card by Artist Two',
      artistId: artist2.id,
    }).create()

    const response = await client
      .get(`/api/v1/cards?page=1&limit=10&artist[]=${artist1.id}`)
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const body = response.body()
    assert.equal(body.data.length, 1)
    assert.equal(body.data[0].id, atist1Card.id)
    assert.equal(body.meta.total, 1)
  })

  test('index - it should filter by subtype when subtype parameter is provided', async ({
    client,
    assert,
  }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()

    const basicSubtype = await SubtypeFactory.merge({ id: 1, label: 'Basic' }).create()
    const stage1Subtype = await SubtypeFactory.merge({ id: 2, label: 'Stage 1' }).create()

    const basicCard = await CardFactory.merge({
      name: 'Basic Card',
    })
      .with('subtypes', 1, (subtypes) => subtypes.merge([basicSubtype]))
      .create()

    await CardFactory.merge({
      name: 'Stage 1 Card',
    })
      .with('subtypes', 1, (subtypes) => subtypes.merge([stage1Subtype]))
      .create()

    const response = await client
      .get(`/api/v1/cards?page=1&limit=10&subtype[]=${basicSubtype.id}`)
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const body = response.body()
    assert.equal(body.data.length, 1)
    assert.equal(body.data[0].id, basicCard.id)
    assert.equal(body.meta.total, 1)
  })

  test('index - it should filter by type when type parameter is provided', async ({
    client,
    assert,
  }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()

    const psychicType = await TypeFactory.merge({ id: 1, label: 'Psychic' }).create()
    const fireType = await TypeFactory.merge({ id: 2, label: 'Fire' }).create()

    await CardFactory.merge({
      name: 'Psychic Card',
    })
      .with('types', 1, (types) => types.merge([psychicType]))
      .create()

    const fireCard = await CardFactory.merge({
      name: 'Fire Card',
    })
      .with('types', 1, (types) => types.merge([fireType]))
      .create()

    const response = await client
      .get(`/api/v1/cards?page=1&limit=10&type[]=${fireType.id}`)
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const body = response.body()
    assert.equal(body.data.length, 1)
    assert.equal(body.data[0].id, fireCard.id)
    assert.equal(body.meta.total, 1)
  })

  test('index - it should apply multiple filters simultaneously', async ({ client, assert }) => {
    await LegalityFactory.create()
    await SetFactory.create()

    const commonRarity = await RarityFactory.merge({ id: 1, label: 'Common' }).create()
    const rareRarity = await RarityFactory.merge({ id: 2, label: 'Rare' }).create()
    const artist1 = await ArtistFactory.merge({ id: 1, name: 'Artist One' }).create()

    await CardFactory.merge({
      name: 'Pikachu Common',
      rarityId: commonRarity.id,
      artistId: artist1.id,
    }).create()

    const matchingCard = await CardFactory.merge({
      name: 'Charizard Common',
      rarityId: commonRarity.id,
      artistId: artist1.id,
    }).create()

    await CardFactory.merge({
      name: 'Pikachu Rare',
      rarityId: rareRarity.id,
      artistId: artist1.id,
    }).create()

    const response = await client
      .get(`/api/v1/cards?page=1&limit=10&name=Char&rarity[]=${commonRarity.id}`)
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const body = response.body()
    assert.equal(body.data.length, 1)
    assert.equal(body.data[0].id, matchingCard.id)
    assert.equal(body.meta.total, 1)
  })

  test('index - it should return empty result when no cards match filters', async ({
    client,
    assert,
  }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()

    await CardFactory.merge({ name: 'Pikachu' }).create()

    const response = await client
      .get('/api/v1/cards')
      .qs({ page: 1, limit: 10, name: 'NonExistentCard' })
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const body = response.body()
    assert.equal(body.data.length, 0)
    assert.equal(body.meta.total, 0)
  })

  test('show - it should return a single base card infos by id', async ({ client, assert }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()
    await CardFactory.merge({ id: `base1-1` }).create()

    const response = await client
      .get('/api/v1/cards/base1-1')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const card = response.body()

    assert.equal(card.id, 'base1-1')
    assert.properties(card, ['id', 'imageLarge', 'number', 'set'])
    assert.properties(card.set, ['id', 'name', 'imageSymbol'])
  })

  test('show - it should return 404 for non-existent card', async ({ client }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()
    await CardFactory.createMany(3)

    const response = await client
      .get('/api/v1/cards/non-existent-id')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(404)

    response.assertBodyContains({
      message: 'Card not found',
      code: 'E_ROW_NOT_FOUND',
    })
  })

  test('show - it should return card with occurrence when user has card in root folio', async ({
    client,
    assert,
  }) => {
    const userId = TEST_AUTH_USER_ID

    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()

    const card = await CardFactory.merge({ id: 'base1-25' }).create()

    // Créer un folio root pour l'utilisateur
    const rootFolio = await FolioFactory.merge({
      userId,
      isRoot: true,
      name: 'My Collection',
    }).create()

    // Ajouter la carte dans le folio avec une occurrence spécifique
    await CardFolioFactory.merge({
      cardId: card.id,
      folioId: rootFolio.id,
      occurrence: 4,
    }).create()

    const response = await client
      .get('/api/v1/cards/base1-25')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const cardResponse = response.body()

    assert.equal(cardResponse.id, 'base1-25')
    assert.properties(cardResponse, ['id', 'imageLarge', 'number', 'occurrence', 'set'])
    assert.equal(cardResponse.occurrence, 4)
    assert.properties(cardResponse.set, ['id', 'name', 'imageSymbol'])
  })

  test('show - it should return card with occurrence 0 when user does not have card in root folio', async ({
    client,
    assert,
  }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()

    await CardFactory.merge({ id: 'base1-26' }).create()

    const response = await client
      .get('/api/v1/cards/base1-26')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const cardResponse = response.body()

    assert.equal(cardResponse.id, 'base1-26')
    assert.properties(cardResponse, ['id', 'imageLarge', 'number', 'occurrence', 'set'])
    assert.equal(cardResponse.occurrence, 0)
    assert.properties(cardResponse.set, ['id', 'name', 'imageSymbol'])
  })

  test('details - it should return a single card details by id', async ({ client, assert }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()
    await CardFactory.merge({ id: `base1-1` }).with('subtypes').create()

    const response = await client
      .get('/api/v1/cards/base1-1/details')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const card = response.body()

    assert.equal(card.id, 'base1-1')
    assert.properties(card, ['id', 'flavorText', 'set', 'rarity', 'artist', 'subtypes'])
    assert.properties(card.set, ['id', 'releaseDate'])
    assert.properties(card.rarity, ['id', 'label'])
    assert.properties(card.artist, ['id', 'name'])
    assert.isArray(card.subtypes)
    assert.properties(card.subtypes[0], ['id', 'label'])
  })

  test('details - it should return 404 for non-existent card', async ({ client }) => {
    const response = await client
      .get('/api/v1/cards/non-existent-/details')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(404)

    response.assertBodyContains({
      message: 'Card not found',
      code: 'E_ROW_NOT_FOUND',
    })
  })

  test('prices - it should return card prices with correct market data structure', async ({
    client,
    assert,
  }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()
    await CardFactory.merge({ id: 'base1-1' })
      .with('cardMarketPrices', 1, (cardMarketPrices) =>
        cardMarketPrices.merge({
          id: 1234567890,
          url: 'https://cardmarket.com/base1-0',
          trendPrice: 10.5,
          reverseHoloTrend: 15.75,
          cardId: 'base1-1',
        })
      )
      .with('tcgPlayerReportings', 1, (tcgPlayerReportings) =>
        tcgPlayerReportings
          .merge({
            id: 1234567890,
            url: 'https://tcgplayer.com/base1-0',
            cardId: 'base1-0',
          })
          .with('tcgPlayerPrices', 2, (tcgPlayerPrices) =>
            tcgPlayerPrices.merge([
              { id: 1234567890, type: 'normal', market: 10.5 },
              { id: 1234567891, type: 'holofoil', market: 15.75 },
            ])
          )
      )
      .create()

    const response = await client
      .get('/api/v1/cards/base1-1/prices')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const cardPrices = response.body()

    assert.equal(cardPrices.id, 'base1-1')

    assert.properties(cardPrices, ['cardMarketReporting'])
    assert.properties(cardPrices.cardMarketReporting, ['id', 'url', 'cardMarketPrices'])
    assert.isArray(cardPrices.cardMarketReporting.cardMarketPrices)
    assert.isNotEmpty(cardPrices.cardMarketReporting.cardMarketPrices)
    const cardMarketfirstPrice = cardPrices.cardMarketReporting.cardMarketPrices[0]
    assert.properties(cardMarketfirstPrice, ['id', 'type', 'market'])

    assert.properties(cardPrices, ['tcgPlayerReporting'])
    assert.properties(cardPrices.tcgPlayerReporting, ['id', 'url', 'tcgPlayerPrices'])
    assert.isArray(cardPrices.tcgPlayerReporting.tcgPlayerPrices)
    assert.isNotEmpty(cardPrices.tcgPlayerReporting.tcgPlayerPrices)
    const tcgPlayerFirstPrice = cardPrices.tcgPlayerReporting.tcgPlayerPrices[0]
    assert.properties(tcgPlayerFirstPrice, ['id', 'type', 'market'])
  })

  test('prices - it should return 404 for non-existent card', async ({ client }) => {
    const response = await client
      .get('/api/v1/cards/non-existent-id/prices')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(404)

    response.assertBodyContains({
      message: 'Card not found',
      code: 'E_ROW_NOT_FOUND',
    })
  })

  test('rarity - it should return all rarities', async ({ client, assert }) => {
    await RarityFactory.create()
    const response = await client
      .get('/api/v1/cards/rarity')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const rarities = response.body()
    assert.isArray(rarities)
    assert.isAbove(rarities.length, 0, 'Expected at least one rarity to be returned')
    assert.properties(rarities[0], ['id', 'label'])
  })

  test('subtype - it should return all subtypes', async ({ client, assert }) => {
    await SubtypeFactory.create()
    const response = await client
      .get('/api/v1/cards/subtype')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const subtypes = response.body()
    assert.isArray(subtypes)
    assert.isAtLeast(subtypes.length, 0, 'Expected at least one subtype to be returned')
    assert.properties(subtypes[0], ['id', 'label'])
  })

  test('artist - it should return all artists', async ({ client, assert }) => {
    await ArtistFactory.create()
    const response = await client
      .get('/api/v1/cards/artist')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const artists = response.body()
    assert.isArray(artists)
    assert.isAtLeast(artists.length, 0, 'Expected at least one artist to be returned')
    assert.properties(artists[0], ['id', 'name'])
  })
})
