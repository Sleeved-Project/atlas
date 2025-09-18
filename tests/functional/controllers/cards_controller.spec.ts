// import { test } from '@japa/runner'
// import testUtils from '@adonisjs/core/services/test_utils'
// import sinon from 'sinon'
// import { CardFactory } from '#database/factories/card'
// import AuthServiceMock, { TEST_AUTH_USER_ID } from '#tests/mocks/auth_service_mock'
// import { ArtistFactory } from '#database/factories/artist'
// import { RarityFactory } from '#database/factories/rarity'
// import { LegalityFactory } from '#database/factories/legality'
// import { SetFactory } from '#database/factories/set'
// import { SubtypeFactory } from '#database/factories/subtype'
// import { TypeFactory } from '#database/factories/type'
// import { FolioFactory } from '#database/factories/folio'
// import { CardFolioFactory } from '#database/factories/card_folio'
// import { CardMarketPriceFactory } from '#database/factories/card_marker_price'
// import { DateTime } from 'luxon'
// import { CardFinishFactory } from '#database/factories/card_finish'
// import { CardConditionFactory } from '#database/factories/card_condition'
// import { NO_EXISTING_CARD_ID, NO_EXISTING_CARD_NAME } from '#tests/mocks/non_existing_mock'

// test.group('Card controller', (group) => {
//   let wardenApiClientStub: sinon.SinonStub

//   group.setup(() => {
//     wardenApiClientStub = AuthServiceMock.setupWardenApiClientStub()
//   })

//   group.each.setup(() => testUtils.db().withGlobalTransaction())

//   group.teardown(() => {
//     wardenApiClientStub.restore()
//   })

//   test('index - it should return paginated cards', async ({ client, assert }) => {
//     const artist = await ArtistFactory.create()
//     const rarity = await RarityFactory.create()
//     const legality = await LegalityFactory.create()
//     const set = await SetFactory.merge({ legalityId: legality.id }).create()
//     await CardFactory.merge({
//       artistId: artist.id,
//       rarityId: rarity.id,
//       setId: set.id,
//       legalityId: legality.id,
//     }).createMany(15)

//     const response = await client
//       .get('/api/v1/cards')
//       .qs({ page: 1, limit: 10 })
//       .header('Authorization', 'Bearer fake-token-for-testing')

//     response.assertStatus(200)

//     const body = response.body()
//     assert.properties(body, ['meta', 'data'])

//     assert.properties(body.meta, [
//       'total',
//       'perPage',
//       'currentPage',
//       'lastPage',
//       'firstPage',
//       'firstPageUrl',
//       'lastPageUrl',
//       'nextPageUrl',
//       'previousPageUrl',
//     ])

//     assert.equal(body.data.length, 10)

//     const firstCard = body.data[0]
//     assert.properties(firstCard, ['id', 'imageSmall'])
//   })

//   test('index - it should apply pagination correctly', async ({ client, assert }) => {
//     const artist = await ArtistFactory.create()
//     const rarity = await RarityFactory.create()
//     const legality = await LegalityFactory.create()
//     const set = await SetFactory.merge({ legalityId: legality.id }).create()
//     await CardFactory.merge({
//       artistId: artist.id,
//       rarityId: rarity.id,
//       setId: set.id,
//       legalityId: legality.id,
//     }).createMany(15)

//     const response1 = await client
//       .get('/api/v1/cards')
//       .qs({ page: 1, limit: 5 })
//       .header('Authorization', 'Bearer fake-token-for-testing')

//     response1.assertStatus(200)
//     const page1Data = response1.body().data

//     const response2 = await client
//       .get('/api/v1/cards')
//       .qs({ page: 2, limit: 5 })
//       .header('Authorization', 'Bearer fake-token-for-testing')
//     response2.assertStatus(200)
//     const page2Data = response2.body().data

//     assert.notEqual(page1Data[0].id, page2Data[0].id)

//     assert.equal(page1Data.length, 5)
//     assert.equal(page2Data.length, 5)
//   })

//   test('index - it should handle invalid pagination parameters', async ({ client }) => {
//     const artist = await ArtistFactory.create()
//     const rarity = await RarityFactory.create()
//     const legality = await LegalityFactory.create()
//     const set = await SetFactory.merge({ legalityId: legality.id }).create()
//     await CardFactory.merge({
//       artistId: artist.id,
//       rarityId: rarity.id,
//       setId: set.id,
//       legalityId: legality.id,
//     }).createMany(15)

//     const responseNegativePage = await client
//       .get('/api/v1/cards')
//       .qs({ page: -1, limit: 10 })
//       .header('Authorization', 'Bearer fake-token-for-testing')

//     responseNegativePage.assertStatus(422)

//     const responseNegativeLimit = await client
//       .get('/api/v1/cards')
//       .qs({ page: 1, limit: -5 })
//       .header('Authorization', 'Bearer fake-token-for-testing')

//     responseNegativeLimit.assertStatus(422)

//     const responseInvalidParams = await client
//       .get('/api/v1/cards')
//       .qs({ page: 'abc', limit: 'xyz' })
//       .header('Authorization', 'Bearer fake-token-for-testing')
//     responseInvalidParams.assertStatus(422)
//   })

//   test('index - it should handle invalid filters params', async ({ client, assert }) => {
//     const artist = await ArtistFactory.create()
//     const rarity = await RarityFactory.create()
//     const legality = await LegalityFactory.create()
//     const set = await SetFactory.merge({ legalityId: legality.id }).create()
//     const cards = await CardFactory.merge({
//       artistId: artist.id,
//       rarityId: rarity.id,
//       setId: set.id,
//       legalityId: legality.id,
//     }).createMany(15)

//     const responseNotExistingFilter = await client
//       .get('/api/v1/cards')
//       .qs({ page: 1, limit: 10, names: cards[0].name })
//       .header('Authorization', 'Bearer fake-token-for-testing')

//     responseNotExistingFilter.assertStatus(200)
//     assert.isAtLeast(responseNotExistingFilter.body().data.length, 1)

//     const responseEmptyFilter = await client
//       .get('/api/v1/cards')
//       .qs({ page: 1, limit: 10, name: '' })
//       .header('Authorization', 'Bearer fake-token-for-testing')

//     responseEmptyFilter.assertStatus(200)
//     assert.equal(responseEmptyFilter.body().data.length, 10)

//     const responseNotExistingName = await client
//       .get('/api/v1/cards')
//       .qs({ page: 1, limit: 10, name: '123QS' })
//       .header('Authorization', 'Bearer fake-token-for-testing')

//     responseNotExistingName.assertStatus(200)
//     assert.isEmpty(responseNotExistingName.body().data)
//   })

//   test('index - it should return 200 and empty page for non-existent page', async ({
//     client,
//     assert,
//   }) => {
//     const artist = await ArtistFactory.create()
//     const rarity = await RarityFactory.create()
//     const legality = await LegalityFactory.create()
//     const set = await SetFactory.merge({ legalityId: legality.id }).create()
//     await CardFactory.merge({
//       artistId: artist.id,
//       rarityId: rarity.id,
//       setId: set.id,
//       legalityId: legality.id,
//     }).createMany(15)

//     const response = await client
//       .get('/api/v1/cards')
//       .qs({ page: 99999, limit: 10 })
//       .header('Authorization', 'Bearer fake-token-for-testing')

//     response.assertStatus(200)
//     assert.isEmpty(response.body().data)
//   })

//   test('index - it should filter by name when name parameter is provided', async ({
//     client,
//     assert,
//   }) => {
//     const artist = await ArtistFactory.create()
//     const rarity = await RarityFactory.create()
//     const legality = await LegalityFactory.create()
//     const set = await SetFactory.merge({ legalityId: legality.id }).create()
//     const pikachuCard = await CardFactory.merge({
//       name: 'Pikachu',
//       artistId: artist.id,
//       rarityId: rarity.id,
//       setId: set.id,
//       legalityId: legality.id,
//     }).create()
//     await CardFactory.merge({
//       name: 'Charizard',
//       artistId: artist.id,
//       rarityId: rarity.id,
//       setId: set.id,
//       legalityId: legality.id,
//     }).create()
//     await CardFactory.merge({
//       name: 'Bulbasaur',
//       artistId: artist.id,
//       rarityId: rarity.id,
//       setId: set.id,
//       legalityId: legality.id,
//     }).create()

//     const response = await client
//       .get('/api/v1/cards')
//       .qs({ page: 1, limit: 10, name: 'Pika' })
//       .header('Authorization', 'Bearer fake-token-for-testing')

//     response.assertStatus(200)

//     const body = response.body()
//     assert.equal(body.data.length, 1)
//     assert.equal(body.data[0].id, pikachuCard.id)
//     assert.equal(body.meta.total, 1)
//   })

//   test('index - it should filter by rarities when rarities parameter is provided', async ({
//     client,
//     assert,
//   }) => {
//     const artist = await ArtistFactory.create()
//     const commonRarity = await RarityFactory.merge({ id: 1, label: 'Common' }).create()
//     const rareRarity = await RarityFactory.merge({ id: 2, label: 'Rare' }).create()
//     const legality = await LegalityFactory.create()
//     console.log('legality', legality)
//     const set = await SetFactory.merge({ legalityId: legality.id }).create()
//     const commonCard = await CardFactory.merge({
//       artistId: artist.id,
//       rarityId: commonRarity.id,
//       setId: set.id,
//       legalityId: legality.id,
//     }).create()
//     await CardFactory.merge({
//       artistId: artist.id,
//       rarityId: rareRarity.id,
//       setId: set.id,
//       legalityId: legality.id,
//     }).create()

//     const response = await client
//       .get(`/api/v1/cards?page=1&limit=10&rarities[]=${commonRarity.id}`)
//       .header('Authorization', 'Bearer fake-token-for-testing')

//     response.assertStatus(200)

//     const body = response.body()
//     assert.equal(body.data.length, 1)
//     assert.equal(body.data[0].id, commonCard.id)
//     assert.equal(body.meta.total, 1)
//   })

//   test('index - it should filter by artists when artists parameter is provided', async ({
//     client,
//     assert,
//   }) => {
//     const rarity = await RarityFactory.create()
//     const artist1 = await ArtistFactory.merge({ id: 1, name: 'Artist One' }).create()
//     const artist2 = await ArtistFactory.merge({ id: 2, name: 'Artist Two' }).create()
//     const legality = await LegalityFactory.create()
//     const set = await SetFactory.merge({ legalityId: legality.id }).create()
//     const atist1Card = await CardFactory.merge({
//       artistId: artist1.id,
//       rarityId: rarity.id,
//       setId: set.id,
//       legalityId: legality.id,
//     }).create()
//     await CardFactory.merge({
//       artistId: artist2.id,
//       rarityId: rarity.id,
//       setId: set.id,
//       legalityId: legality.id,
//     }).create()

//     const response = await client
//       .get(`/api/v1/cards?page=1&limit=10&artists[]=${artist1.id}`)
//       .header('Authorization', 'Bearer fake-token-for-testing')

//     response.assertStatus(200)

//     const body = response.body()
//     assert.equal(body.data.length, 1)
//     assert.equal(body.data[0].id, atist1Card.id)
//     assert.equal(body.meta.total, 1)
//   })

//   test('index - it should filter by subtypes when subtypes parameter is provided', async ({
//     client,
//     assert,
//   }) => {
//     const rarity = await RarityFactory.create()
//     const artist = await ArtistFactory.create()
//     const legality = await LegalityFactory.create()
//     const set = await SetFactory.merge({ legalityId: legality.id }).create()
//     const basicSubtype = await SubtypeFactory.create()
//     const stage1Subtype = await SubtypeFactory.create()
//     const basicCard = await CardFactory.merge({
//       artistId: artist.id,
//       rarityId: rarity.id,
//       setId: set.id,
//       legalityId: legality.id,
//     })
//       .with('subtypes', 1, (subtypes) => subtypes.merge([basicSubtype]))
//       .create()
//     await CardFactory.merge({
//       artistId: artist.id,
//       rarityId: rarity.id,
//       setId: set.id,
//       legalityId: legality.id,
//     })
//       .with('subtypes', 1, (subtypes) => subtypes.merge([stage1Subtype]))
//       .create()

//     const response = await client
//       .get(`/api/v1/cards?page=1&limit=10&subtypes[]=${basicSubtype.id}`)
//       .header('Authorization', 'Bearer fake-token-for-testing')

//     response.assertStatus(200)

//     const body = response.body()
//     assert.equal(body.data.length, 1)
//     assert.equal(body.data[0].id, basicCard.id)
//     assert.equal(body.meta.total, 1)
//   })

//   test('index - it should filter by types when types parameter is provided', async ({
//     client,
//     assert,
//   }) => {
//     const rarity = await RarityFactory.create()
//     const artist = await ArtistFactory.create()
//     const legality = await LegalityFactory.create()
//     const set = await SetFactory.merge({ legalityId: legality.id }).create()
//     const psychicType = await TypeFactory.create()
//     const fireType = await TypeFactory.create()
//     const fireCard = await CardFactory.merge({
//       artistId: artist.id,
//       rarityId: rarity.id,
//       setId: set.id,
//       legalityId: legality.id,
//     })
//       .with('types', 1, (types) => types.merge([fireType]))
//       .create()
//     await CardFactory.merge({
//       artistId: artist.id,
//       rarityId: rarity.id,
//       setId: set.id,
//       legalityId: legality.id,
//     })
//       .with('types', 1, (types) => types.merge([psychicType]))
//       .create()

//     const response = await client
//       .get(`/api/v1/cards?page=1&limit=10&types[]=${fireType.id}`)
//       .header('Authorization', 'Bearer fake-token-for-testing')

//     response.assertStatus(200)

//     const body = response.body()
//     assert.equal(body.data.length, 1)
//     assert.equal(body.data[0].id, fireCard.id)
//     assert.equal(body.meta.total, 1)
//   })

//   test('index - it should apply multiple filters simultaneously', async ({ client, assert }) => {
//     const commonRarity = await RarityFactory.create()
//     const rareRarity = await RarityFactory.create()
//     const artist = await ArtistFactory.create()
//     const legality = await LegalityFactory.create()
//     const set = await SetFactory.merge({ legalityId: legality.id }).create()
//     const matchingCard = await CardFactory.merge({
//       name: 'Charizard Common',
//       artistId: artist.id,
//       rarityId: commonRarity.id,
//       setId: set.id,
//       legalityId: legality.id,
//     }).create()
//     await CardFactory.merge({
//       name: 'Pikachu Common',
//       artistId: artist.id,
//       rarityId: commonRarity.id,
//       setId: set.id,
//       legalityId: legality.id,
//     }).create()
//     await CardFactory.merge({
//       name: 'Pikachu Rare',
//       artistId: artist.id,
//       rarityId: rareRarity.id,
//       setId: set.id,
//       legalityId: legality.id,
//     }).create()

//     const response = await client
//       .get(`/api/v1/cards?page=1&limit=10&name=Char&rarities[]=${commonRarity.id}`)
//       .header('Authorization', 'Bearer fake-token-for-testing')

//     response.assertStatus(200)

//     const body = response.body()
//     assert.equal(body.data.length, 1)
//     assert.equal(body.data[0].id, matchingCard.id)
//     assert.equal(body.meta.total, 1)
//   })

//   test('index - it should return empty result when no cards match filters', async ({
//     client,
//     assert,
//   }) => {
//     const rarity = await RarityFactory.create()
//     const artist = await ArtistFactory.create()
//     const legality = await LegalityFactory.create()
//     const set = await SetFactory.merge({ legalityId: legality.id }).create()
//     await CardFactory.merge({
//       artistId: artist.id,
//       rarityId: rarity.id,
//       setId: set.id,
//       legalityId: legality.id,
//     }).create()

//     const response = await client
//       .get('/api/v1/cards')
//       .qs({ page: 1, limit: 10, name: NO_EXISTING_CARD_NAME })
//       .header('Authorization', 'Bearer fake-token-for-testing')

//     response.assertStatus(200)

//     const body = response.body()
//     assert.equal(body.data.length, 0)
//     assert.equal(body.meta.total, 0)
//   })

//   test('show - it should return a single base card infos by id', async ({ client, assert }) => {
//     const rarity = await RarityFactory.create()
//     const artist = await ArtistFactory.create()
//     const legality = await LegalityFactory.create()
//     const set = await SetFactory.merge({ legalityId: legality.id }).create()
//     const card = await CardFactory.merge({
//       artistId: artist.id,
//       rarityId: rarity.id,
//       setId: set.id,
//       legalityId: legality.id,
//     }).create()

//     const response = await client
//       .get(`/api/v1/cards/${card.id}`)
//       .header('Authorization', 'Bearer fake-token-for-testing')

//     response.assertStatus(200)

//     const data = response.body()

//     assert.equal(data.id, card.id)
//     assert.properties(data, ['id', 'imageLarge', 'number', 'set'])
//     assert.properties(data.set, ['id', 'name', 'imageSymbol'])
//   })

//   test('show - it should return 404 for non-existent card', async ({ client }) => {
//     const rarity = await RarityFactory.create()
//     const artist = await ArtistFactory.create()
//     const legality = await LegalityFactory.create()
//     const set = await SetFactory.merge({ legalityId: legality.id }).create()
//     await CardFactory.merge({
//       artistId: artist.id,
//       rarityId: rarity.id,
//       setId: set.id,
//       legalityId: legality.id,
//     }).createMany(3)

//     const response = await client
//       .get(`/api/v1/cards/${NO_EXISTING_CARD_ID}`)
//       .header('Authorization', 'Bearer fake-token-for-testing')

//     response.assertStatus(404)

//     response.assertBodyContains({
//       message: 'Card not found',
//       code: 'E_ROW_NOT_FOUND',
//     })
//   })

//   test('show - it should return card with occurrence when user has card in root folio', async ({
//     client,
//     assert,
//   }) => {
//     const rarity = await RarityFactory.create()
//     const artist = await ArtistFactory.create()
//     const legality = await LegalityFactory.create()
//     const set = await SetFactory.merge({ legalityId: legality.id }).create()
//     const card = await CardFactory.merge({
//       artistId: artist.id,
//       rarityId: rarity.id,
//       setId: set.id,
//       legalityId: legality.id,
//     }).create()

//     const rootFolio = await FolioFactory.merge({
//       userId: TEST_AUTH_USER_ID,
//       isRoot: true,
//     }).create()

//     await CardFolioFactory.merge({
//       cardId: card.id,
//       folioId: rootFolio.id,
//       occurrence: 4,
//     }).create()

//     const response = await client
//       .get(`/api/v1/cards/${card.id}`)
//       .header('Authorization', 'Bearer fake-token-for-testing')

//     response.assertStatus(200)

//     const data = response.body()

//     assert.equal(data.id, card.id)
//     assert.properties(data, ['id', 'imageLarge', 'number', 'occurrence', 'set'])
//     assert.equal(data.occurrence, 4)
//     assert.properties(data.set, ['id', 'name', 'imageSymbol'])
//   })

//   test('show - it should return card with occurrence 0 when user does not have card in root folio', async ({
//     client,
//     assert,
//   }) => {
//     const rarity = await RarityFactory.create()
//     const artist = await ArtistFactory.create()
//     const legality = await LegalityFactory.create()
//     const set = await SetFactory.merge({ legalityId: legality.id }).create()
//     const card = await CardFactory.merge({
//       artistId: artist.id,
//       rarityId: rarity.id,
//       setId: set.id,
//       legalityId: legality.id,
//     }).create()

//     await FolioFactory.merge({
//       userId: TEST_AUTH_USER_ID,
//       isRoot: true,
//     }).create()

//     const response = await client
//       .get(`/api/v1/cards/${card.id}`)
//       .header('Authorization', 'Bearer fake-token-for-testing')

//     response.assertStatus(200)

//     const data = response.body()

//     assert.equal(data.id, card.id)
//     assert.properties(data, ['id', 'imageLarge', 'number', 'occurrence', 'set'])
//     assert.equal(data.occurrence, 0)
//     assert.properties(data.set, ['id', 'name', 'imageSymbol'])
//   })

// test('details - it should return a single card details by id', async ({ client, assert }) => {
//   const rarity = await RarityFactory.create()
//   const artist = await ArtistFactory.create()
//   const legality = await LegalityFactory.create()
//   const set = await SetFactory.merge({ legalityId: legality.id }).create()
//   const subtype = await SubtypeFactory.create()
//   const card = await CardFactory.merge({
//     artistId: artist.id,
//     rarityId: rarity.id,
//     setId: set.id,
//     legalityId: legality.id,
//   })
//     .with('subtypes', 1, (subtypes) => subtypes.merge([subtype]))
//     .create()

//   await CardFactory.merge({ id: `base1-1` }).with('subtypes').create()

//   const response = await client
//     .get('/api/v1/cards/base1-1/details')
//     .header('Authorization', 'Bearer fake-token-for-testing')

//   response.assertStatus(200)

//   const data = response.body()

//   assert.equal(data.id, 'base1-1')
//   assert.properties(data, ['id', 'flavorText', 'set', 'rarity', 'artist', 'subtypes'])
//   assert.properties(data.set, ['id', 'releaseDate'])
//   assert.properties(data.rarity, ['id', 'label'])
//   assert.properties(data.artist, ['id', 'name'])
//   assert.isArray(data.subtypes)
//   assert.properties(data.subtypes[0], ['id', 'label'])
// })

// test('details - it should return 404 for non-existent card', async ({ client }) => {
//   const response = await client
//     .get('/api/v1/cards/non-existent-/details')
//     .header('Authorization', 'Bearer fake-token-for-testing')

//   response.assertStatus(404)

//   response.assertBodyContains({
//     message: 'Card not found',
//     code: 'E_ROW_NOT_FOUND',
//   })
// })

// test('prices - it should return card prices with correct market data structure', async ({
//   client,
//   assert,
// }) => {
//   await ArtistFactory.create()
//   await RarityFactory.create()
//   await LegalityFactory.create()
//   await SetFactory.merge({ id: 'base1' }).create()

//   await CardFactory.merge({ id: 'base1-1' })
//     .with('cardMarketPrices', 1, (cardMarketPrices) =>
//       cardMarketPrices.merge({
//         id: 1234567890,
//         url: 'https://cardmarket.com/base1-0',
//         trendPrice: 10.5,
//         reverseHoloTrend: 15.75,
//         cardId: 'base1-1',
//       })
//     )
//     .with('tcgPlayerReportings', 1, (tcgPlayerReportings) =>
//       tcgPlayerReportings
//         .merge({
//           id: 1234567890,
//           url: 'https://tcgplayer.com/base1-0',
//           cardId: 'base1-0',
//         })
//         .with('tcgPlayerPrices', 2, (tcgPlayerPrices) =>
//           tcgPlayerPrices.merge([
//             { id: 1234567890, type: 'normal', market: 10.5 },
//             { id: 1234567891, type: 'holofoil', market: 15.75 },
//           ])
//         )
//     )
//     .create()

//   const response = await client
//     .get('/api/v1/cards/base1-1/prices')
//     .header('Authorization', 'Bearer fake-token-for-testing')

//   response.assertStatus(200)

//   const cardPrices = response.body()

//   assert.equal(cardPrices.id, 'base1-1')

//   assert.properties(cardPrices, ['cardMarketReporting'])
//   assert.properties(cardPrices.cardMarketReporting, ['id', 'url', 'cardMarketPrices'])
//   assert.isArray(cardPrices.cardMarketReporting.cardMarketPrices)
//   assert.isNotEmpty(cardPrices.cardMarketReporting.cardMarketPrices)
//   const cardMarketfirstPrice = cardPrices.cardMarketReporting.cardMarketPrices[0]
//   assert.properties(cardMarketfirstPrice, ['id', 'type', 'market'])

//   assert.properties(cardPrices, ['tcgPlayerReporting'])
//   assert.properties(cardPrices.tcgPlayerReporting, ['id', 'url', 'tcgPlayerPrices'])
//   assert.isArray(cardPrices.tcgPlayerReporting.tcgPlayerPrices)
//   assert.isNotEmpty(cardPrices.tcgPlayerReporting.tcgPlayerPrices)
//   const tcgPlayerFirstPrice = cardPrices.tcgPlayerReporting.tcgPlayerPrices[0]
//   assert.properties(tcgPlayerFirstPrice, ['id', 'type', 'market'])
// })

// test('prices - it should return 404 for non-existent card', async ({ client }) => {
//   const response = await client
//     .get('/api/v1/cards/non-existent-id/prices')
//     .header('Authorization', 'Bearer fake-token-for-testing')

//   response.assertStatus(404)

//   response.assertBodyContains({
//     message: 'Card not found',
//     code: 'E_ROW_NOT_FOUND',
//   })
// })

// test('advices - should return price advice for a card', async ({ client, assert }) => {
//   // Setup
//   await ArtistFactory.create()
//   await RarityFactory.create()
//   await LegalityFactory.create()
//   await SetFactory.merge({ id: 'base1' }).create()

//   const card = await CardFactory.merge({ id: 'base1-1' }).create()
//   const finish = await CardFinishFactory.create()
//   const condition = await CardConditionFactory.create()

//   await CardMarketPriceFactory.merge({
//     cardId: card.id,
//     trendPrice: 10.0,
//     reverseHoloTrend: 15.0,
//     updatedAt: DateTime.now(),
//   }).create()

//   const response = await client
//     .get(`/api/v1/cards/${card.id}/advices`)
//     .qs({ conditions: condition.id, finishes: finish.id })
//     .header('Authorization', 'Bearer fake-token-for-testing')

//   response.assertStatus(200)
//   const body = response.body()

//   assert.exists(body.advicePrice)
//   assert.isString(body.advicePrice)
//   assert.notEqual(body.advicePrice, 'unknown')
// })

// test('advices - should return unknown when no prices available', async ({ client, assert }) => {
//   // Setup
//   await ArtistFactory.create()
//   await RarityFactory.create()
//   await LegalityFactory.create()
//   await SetFactory.merge({ id: 'base1' }).create()

//   const card = await CardFactory.merge({ id: 'base1-1' }).create()
//   const finish = await CardFinishFactory.create()
//   const condition = await CardConditionFactory.create()

//   const response = await client
//     .get(`/api/v1/cards/${card.id}/advices`)
//     .qs({ conditions: condition.id, finishes: finish.id })
//     .header('Authorization', 'Bearer fake-token-for-testing')

//   response.assertStatus(200)
//   assert.equal(response.body().advicePrice, 'unknown')
// })

// test('advices - should handle invalid query parameters', async ({ client }) => {
//   // Setup
//   await ArtistFactory.create()
//   await RarityFactory.create()
//   await LegalityFactory.create()
//   await SetFactory.merge({ id: 'base1' }).create()

//   const card = await CardFactory.merge({ id: 'base1-1' }).create()

//   const response = await client
//     .get(`/api/v1/cards/${card.id}/advices`)
//     .qs({ conditions: 'invalid', finishes: 'invalid' })
//     .header('Authorization', 'Bearer fake-token-for-testing')

//   response.assertStatus(422)
// })

// test('advices - should return 404 for non-existent card', async ({ client }) => {
//   const finish = await CardFinishFactory.create()
//   const condition = await CardConditionFactory.create()

//   const response = await client
//     .get('/api/v1/cards/non-existent-id/advices')
//     .qs({ conditions: condition.id, finishes: finish.id })
//     .header('Authorization', 'Bearer fake-token-for-testing')

//   response.assertStatus(404)
//   response.assertBodyContains({
//     message: 'Card not found',
//     code: 'E_ROW_NOT_FOUND',
//   })
// })
// })
