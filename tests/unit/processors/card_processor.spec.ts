// import { ArtistFactory } from '#database/factories/artist'
// import { CardFactory } from '#database/factories/card'
// import { CardFolioFactory } from '#database/factories/card_folio'
// import { FolioFactory } from '#database/factories/folio'
// import { LegalityFactory } from '#database/factories/legality'
// import { RarityFactory } from '#database/factories/rarity'
// import { SetFactory } from '#database/factories/set'
// import { UserFactory } from '#database/factories/user'
// import Card from '#models/card'
// import CardProcessor from '#processors/card_processor'
// import CardFolioService from '#services/card_folio_service'
// import { TEST_AUTH_USER_ID } from '#tests/mocks/auth_service_mock'
// import testUtils from '@adonisjs/core/services/test_utils'
// import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
// import { test } from '@japa/runner'

// test.group('CardService', (group) => {
//   group.each.setup(() => testUtils.db().withGlobalTransaction())

//   let cardProcessor: CardProcessor
//   let cardFolioService: CardFolioService

//   group.setup(() => {
//     cardFolioService = new CardFolioService()
//     cardProcessor = new CardProcessor(cardFolioService)
//   })

//   test('processCardsWithOwnership - should return cards with correct ownership information', async ({
//     assert,
//   }) => {
//     const userId = TEST_AUTH_USER_ID

//     await ArtistFactory.create()
//     await RarityFactory.create()
//     await LegalityFactory.create()
//     await SetFactory.merge({ id: 'base1' }).create()

//     // Create main folio for the user
//     const mainFolio = await FolioFactory.merge({
//       userId,
//       isRoot: true,
//     }).create()

//     // Create some cards
//     const cards = await CardFactory.createMany(4)

//     // Add some cards to the user's main folio
//     await CardFolioFactory.merge([
//       { cardId: cards[0].id, folioId: mainFolio.id, occurrence: 2 },
//       { cardId: cards[2].id, folioId: mainFolio.id, occurrence: 1 },
//     ]).createMany(2)

//     // Simulate a paginated response
//     const mockPaginatedCards = {
//       all: () => cards,
//       getMeta: () => ({
//         total: 4,
//         perPage: 10,
//         currentPage: 1,
//         lastPage: 1,
//         firstPage: 1,
//         firstPageUrl: '/cards?page=1',
//         lastPageUrl: '/cards?page=1',
//         nextPageUrl: null,
//         previousPageUrl: null,
//       }),
//     } as ModelPaginatorContract<Card>

//     const result = await cardProcessor.processCardsWithOwnership(mockPaginatedCards, userId)

//     // Verify the structure of the result
//     assert.property(result, 'meta')
//     assert.property(result, 'data')
//     assert.equal(result.data.length, 4)

//     // Check ownership status
//     const cardsWithOwnership = result.data
//     assert.equal(cardsWithOwnership[0].isOwned, true)
//     assert.equal(cardsWithOwnership[1].isOwned, false)
//     assert.equal(cardsWithOwnership[2].isOwned, true)
//     assert.equal(cardsWithOwnership[3].isOwned, false)

//     // Check properties of each card
//     cardsWithOwnership.forEach((card) => {
//       assert.properties(card, ['id', 'imageSmall', 'isOwned'])
//       assert.isString(card.id)
//       assert.isString(card.imageSmall)
//       assert.isBoolean(card.isOwned)
//     })

//     // Check pagination metadata
//     assert.properties(result.meta, [
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
//     assert.equal(result.meta.total, 4)
//     assert.equal(result.meta.currentPage, 1)
//   })

//   test('processCardsWithOwnership - should return all cards as not owned when user has no main folio', async ({
//     assert,
//   }) => {
//     const userId = TEST_AUTH_USER_ID

//     await ArtistFactory.create()
//     await RarityFactory.create()
//     await LegalityFactory.create()
//     await SetFactory.merge({ id: 'base1' }).create()

//     const cards = await CardFactory.createMany(3)

//     const mockPaginatedCards = {
//       all: () => cards,
//       getMeta: () => ({
//         total: 3,
//         perPage: 10,
//         currentPage: 1,
//         lastPage: 1,
//         firstPage: 1,
//         firstPageUrl: '/cards?page=1',
//         lastPageUrl: '/cards?page=1',
//         nextPageUrl: null,
//         previousPageUrl: null,
//       }),
//     } as ModelPaginatorContract<Card>

//     const result = await cardProcessor.processCardsWithOwnership(mockPaginatedCards, userId)

//     assert.equal(result.data.length, 3)

//     result.data.forEach((card) => {
//       assert.equal(card.isOwned, false)
//       assert.properties(card, ['id', 'imageSmall', 'isOwned'])
//     })

//     assert.equal(result.meta.total, 3)
//     assert.equal(result.meta.currentPage, 1)
//   })

//   test('processCardsWithOwnership - should only consider cards from user main folio, not secondary folios', async ({
//     assert,
//   }) => {
//     const userId1 = TEST_AUTH_USER_ID
//     const userId2 = 'other-user-id'

//     await UserFactory.merge({
//       id: userId2,
//       username: 'other-test-user',
//     }).create()

//     await ArtistFactory.create()
//     await RarityFactory.create()
//     await LegalityFactory.create()
//     await SetFactory.merge({ id: 'base1' }).create()

//     const user1MainFolio = await FolioFactory.merge({
//       userId: userId1,
//       isRoot: true,
//     }).create()

//     const user1SecondaryFolio = await FolioFactory.merge({
//       userId: userId1,
//       isRoot: false,
//     }).create()

//     const user2MainFolio = await FolioFactory.merge({
//       userId: userId2,
//       isRoot: true,
//     }).create()

//     const cards = await CardFactory.createMany(4)

//     await CardFolioFactory.merge([
//       { cardId: cards[0].id, folioId: user1MainFolio.id, occurrence: 1 }, // Should be owned
//       { cardId: cards[1].id, folioId: user1SecondaryFolio.id, occurrence: 2 }, // Should NOT be owned (secondary folio)
//       { cardId: cards[2].id, folioId: user2MainFolio.id, occurrence: 3 }, // Should NOT be owned (secondary folio)
//     ]).createMany(3)

//     const mockPaginatedCards = {
//       all: () => cards,
//       getMeta: () => ({
//         total: 4,
//         perPage: 10,
//         currentPage: 1,
//         lastPage: 1,
//         firstPage: 1,
//         firstPageUrl: '/cards?page=1',
//         lastPageUrl: '/cards?page=1',
//         nextPageUrl: null,
//         previousPageUrl: null,
//       }),
//     } as ModelPaginatorContract<Card>

//     const result = await cardProcessor.processCardsWithOwnership(mockPaginatedCards, userId1)

//     assert.equal(result.data.length, 4)

//     assert.equal(result.data[0].isOwned, true)
//     assert.equal(result.data[1].isOwned, false)
//     assert.equal(result.data[2].isOwned, false)
//     assert.equal(result.data[3].isOwned, false)

//     assert.equal(result.data[0].id, cards[0].id)
//     assert.equal(result.data[1].id, cards[1].id)
//     assert.equal(result.data[2].id, cards[2].id)
//     assert.equal(result.data[3].id, cards[3].id)
//   })
// })
