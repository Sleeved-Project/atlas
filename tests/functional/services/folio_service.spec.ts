// import { test } from '@japa/runner'
// import FolioService from '#services/folio_service'
// import testUtils from '@adonisjs/core/services/test_utils'
// import Folio from '#models/folio'
// import { FolioFactory } from '#database/factories/folio'
// import { TEST_AUTH_USER_ID } from '#tests/mocks/auth_service_mock'
// import { CardFactory } from '#database/factories/card'
// import { CardFolioFactory } from '#database/factories/card_folio'
// import { ArtistFactory } from '#database/factories/artist'
// import { RarityFactory } from '#database/factories/rarity'
// import { LegalityFactory } from '#database/factories/legality'
// import { SetFactory } from '#database/factories/set'
// import { TypeFactory } from '#database/factories/type'
// import { SubtypeFactory } from '#database/factories/subtype'
// import { DateTime } from 'luxon'
// import { UserFactory } from '#database/factories/user'

// test.group('FolioService', (group) => {
//   group.each.setup(() => testUtils.db().withGlobalTransaction())

//   let folioService: FolioService

//   group.setup(() => {
//     folioService = new FolioService()
//   })

//   test('createMainFolio - should create a root folio for a user', async ({ assert }) => {
//     const userId = '123'

//     const folio = await folioService.createMainFolio(userId)

//     assert.exists(folio)
//     assert.equal(folio.userId, userId)
//     assert.equal(folio.name, 'root')
//     assert.isNull(folio.image)
//     assert.isTrue(folio.isRoot)

//     const savedFolio = await Folio.query().where({ userId, isRoot: true }).first()
//     assert.exists(savedFolio)
//     assert.equal(savedFolio!.id, folio.id)
//   })

//   test('createMainFolio - should throw DuplicateEntryException when root folio already exists', async ({
//     assert,
//   }) => {
//     const userId = '123'

//     await FolioFactory.merge({
//       userId,
//       isRoot: true,
//       name: 'Existing Root Folio',
//     }).create()

//     await assert.rejects(
//       () => folioService.createMainFolio(userId),
//       'User already has a root folio'
//     )

//     const rootFolios = await Folio.query().where({ userId, isRoot: true }).count('* as count')
//     assert.equal(rootFolios[0].$extras.count, 1)
//   })

//   test('getMainFolioByUserId - should return the root folio for a user', async ({ assert }) => {
//     const userId = TEST_AUTH_USER_ID

//     const rootFolio = await FolioFactory.merge({
//       userId,
//       name: 'root',
//       isRoot: true,
//     }).create()

//     await FolioFactory.merge({
//       userId,
//       name: 'Secondary Collection',
//       isRoot: false,
//     }).create()

//     const result = await folioService.getMainFolioByUserId(userId)

//     assert.exists(result)
//     assert.equal(result.id, rootFolio.id)
//     assert.equal(result.userId, userId)
//     assert.equal(result.name, 'root')
//     assert.equal(result.isRoot, 1)
//   })

//   test('getMainFolioByUserId - should throw error when user has no root folio', async ({
//     assert,
//   }) => {
//     const userId = 'user-without-root-folio'

//     await UserFactory.merge({
//       id: userId,
//       username: 'user-without-root-folio',
//     }).create()

//     await FolioFactory.merge({
//       userId,
//       name: 'Non-Root Collection',
//       isRoot: false,
//     }).create()

//     await assert.rejects(
//       async () => await folioService.getMainFolioByUserId(userId),
//       'Row not found'
//     )
//   })

//   test('createFolio - should create a custom folio for a user', async ({ assert }) => {
//     const userId = TEST_AUTH_USER_ID
//     const folioName = 'My Custom Collection'
//     const folioImage = 'https://example.com/custom-folio.jpg'

//     const folio = await folioService.createFolio(userId, folioName, folioImage)

//     assert.exists(folio)
//     assert.equal(folio.userId, userId)
//     assert.equal(folio.name, folioName)
//     assert.equal(folio.image, folioImage)
//     assert.isFalse(folio.isRoot)

//     const savedFolio = await Folio.query()
//       .where('user_id', userId)
//       .where('name', folioName)
//       .where('is_root', false)
//       .first()

//     assert.exists(savedFolio)
//     assert.equal(savedFolio!.id, folio.id)
//   })

//   test('createFolio - should allow multiple custom folios for same user', async ({ assert }) => {
//     const userId = TEST_AUTH_USER_ID

//     const folio1 = await folioService.createFolio(userId, 'Collection 1', 'image1.jpg')
//     const folio2 = await folioService.createFolio(userId, 'Collection 2', 'image2.jpg')

//     assert.exists(folio1)
//     assert.exists(folio2)
//     assert.notEqual(folio1.id, folio2.id)
//     assert.equal(folio1.userId, userId)
//     assert.equal(folio2.userId, userId)
//     assert.isFalse(folio1.isRoot)
//     assert.isFalse(folio2.isRoot)

//     const userFolios = await Folio.query().where('user_id', userId).where('is_root', false)

//     assert.lengthOf(userFolios, 2)
//   })

//   test('getAllChildFolioWithCardPricesByUserId - should return child folios with card prices for user', async ({
//     assert,
//   }) => {
//     const userId = TEST_AUTH_USER_ID

//     await ArtistFactory.create()
//     await RarityFactory.create()
//     await LegalityFactory.create()
//     await SetFactory.merge({ id: 'base1' }).create()
//     await TypeFactory.create()
//     await SubtypeFactory.create()

//     await FolioFactory.merge({
//       userId,
//       name: 'root',
//       isRoot: true,
//     }).create()

//     const childFolio1 = await FolioFactory.merge({
//       userId,
//       name: 'Collection 1',
//       isRoot: false,
//       createdAt: DateTime.now().minus({ days: 3 }),
//     }).create()

//     const childFolio2 = await FolioFactory.merge({
//       userId,
//       name: 'Collection 2',
//       isRoot: false,
//       createdAt: DateTime.now().minus({ days: 5 }),
//     }).create()

//     const cards = await CardFactory.with('cardMarketPrices', 1, (cardMarketPrices) =>
//       cardMarketPrices.merge({
//         trendPrice: 10.5,
//         reverseHoloTrend: 15.75,
//       })
//     )
//       .with('tcgPlayerReportings', 1, (tcgPlayerReportings) =>
//         tcgPlayerReportings.with('tcgPlayerPrices', 2, (tcgPlayerPrices) =>
//           tcgPlayerPrices.merge([
//             { type: 'normal', market: 12.0 },
//             { type: 'holofoil', market: 18.5 },
//           ])
//         )
//       )
//       .createMany(2)

//     await CardFolioFactory.merge([
//       { cardId: cards[0].id, folioId: childFolio1.id, occurrence: 2 },
//       { cardId: cards[1].id, folioId: childFolio2.id, occurrence: 1 },
//     ]).createMany(2)

//     const result = await folioService.getAllChildFolioWithCardPricesByUserId(userId, 1)

//     assert.lengthOf(result, 2)
//     assert.exists(result[0].cardFolios)
//     assert.exists(result[1].cardFolios)
//     assert.lengthOf(result[0].cardFolios, 1)
//     assert.lengthOf(result[1].cardFolios, 1)

//     assert.equal(result[0].id, childFolio1.id)
//     assert.equal(result[1].id, childFolio2.id)

//     assert.exists(result[0].cardFolios[0].card)
//     assert.exists(result[0].cardFolios[0].card.cardMarketPrices)
//     assert.exists(result[0].cardFolios[0].card.tcgPlayerReportings)
//   })
//   test('getAllChildFolioWithCardPricesByUserId - should only return child folios, not root folio', async ({
//     assert,
//   }) => {
//     const userId = TEST_AUTH_USER_ID

//     await FolioFactory.merge({
//       userId,
//       name: 'root',
//       isRoot: true,
//     }).create()

//     const childFolio = await FolioFactory.merge({
//       userId,
//       name: 'Child Collection',
//       isRoot: false,
//     }).create()

//     const result = await folioService.getAllChildFolioWithCardPricesByUserId(userId, 1)

//     assert.lengthOf(result, 1)
//     assert.equal(result[0].id, childFolio.id)
//   })

//   test('getAllChildFolioWithCardPricesByUserId - should only return folios for specified user', async ({
//     assert,
//   }) => {
//     const userId = TEST_AUTH_USER_ID
//     const otherUserId = 'other-user-id'

//     await FolioFactory.merge({
//       userId,
//       name: 'My Collection',
//       isRoot: false,
//     }).create()

//     await UserFactory.merge({
//       id: otherUserId,
//       username: 'other-test-user',
//     }).create()

//     await FolioFactory.merge({
//       userId: otherUserId,
//       name: 'Other Collection',
//       isRoot: false,
//     }).create()

//     const result = await folioService.getAllChildFolioWithCardPricesByUserId(userId, 1)

//     assert.lengthOf(result, 1)

//     const getUserFolio = await Folio.findOrFail(result[0].id)
//     assert.equal(getUserFolio.userId, userId)
//   })

//   test('getMyChildFolioWithCardPrices - should return specific child folio with card prices', async ({
//     assert,
//   }) => {
//     const userId = TEST_AUTH_USER_ID

//     await ArtistFactory.create()
//     await RarityFactory.create()
//     await LegalityFactory.create()
//     await SetFactory.merge({ id: 'base1' }).create()
//     await TypeFactory.create()
//     await SubtypeFactory.create()

//     const targetFolio = await FolioFactory.merge({
//       userId,
//       name: 'Target Collection',
//       image: 'target.jpg',
//       isRoot: false,
//     }).create()

//     const otherFolio = await FolioFactory.merge({
//       userId,
//       name: 'Other Collection',
//       isRoot: false,
//     }).create()

//     const cards = await CardFactory.with('cardMarketPrices', 1, (cardMarketPrices) =>
//       cardMarketPrices.merge({
//         trendPrice: 25.0,
//         reverseHoloTrend: 35.0,
//       })
//     )
//       .with('tcgPlayerReportings', 1, (tcgPlayerReportings) =>
//         tcgPlayerReportings.with('tcgPlayerPrices', 1, (tcgPlayerPrices) =>
//           tcgPlayerPrices.merge({ type: 'normal', market: 20.0 })
//         )
//       )
//       .createMany(2)

//     await CardFolioFactory.merge([
//       { cardId: cards[0].id, folioId: targetFolio.id, occurrence: 3 },
//       { cardId: cards[1].id, folioId: otherFolio.id, occurrence: 1 },
//     ]).createMany(2)

//     const result = await folioService.getMyChildFolioWithCardPrices(targetFolio.id, 1)

//     assert.exists(result)
//     assert.equal(result.id, targetFolio.id)
//     assert.equal(result.name, 'Target Collection')
//     assert.equal(result.image, 'target.jpg')
//     assert.exists(result.createdAt)

//     // Verify only target folio's cards are returned
//     assert.exists(result.cardFolios)
//     assert.lengthOf(result.cardFolios, 1)
//     assert.equal(result.cardFolios[0].cardId, cards[0].id)
//     assert.equal(result.cardFolios[0].occurrence, 3)

//     // Verify preloaded relations
//     assert.exists(result.cardFolios[0].card)
//     assert.exists(result.cardFolios[0].card.cardMarketPrices)
//     assert.exists(result.cardFolios[0].card.tcgPlayerReportings)
//   })

//   test('getMyChildFolioWithCardPrices - should throw error when folio does not exist', async ({
//     assert,
//   }) => {
//     const nonExistentFolioId = 'non-existent-folio-id'

//     await assert.rejects(
//       async () => await folioService.getMyChildFolioWithCardPrices(nonExistentFolioId, 1),
//       'Row not found'
//     )
//   })

//   test('getMyChildFolioWithCardPrices - should return folio with empty cardFolios when no cards', async ({
//     assert,
//   }) => {
//     const userId = TEST_AUTH_USER_ID

//     const emptyFolio = await FolioFactory.merge({
//       userId,
//       name: 'Empty Collection',
//       image: 'empty.jpg',
//       isRoot: false,
//     }).create()

//     const result = await folioService.getMyChildFolioWithCardPrices(emptyFolio.id, 1)

//     assert.exists(result)
//     assert.equal(result.id, emptyFolio.id)
//     assert.equal(result.name, 'Empty Collection')
//     assert.equal(result.image, 'empty.jpg')
//     assert.exists(result.cardFolios)
//     assert.lengthOf(result.cardFolios, 0)
//   })
// })
