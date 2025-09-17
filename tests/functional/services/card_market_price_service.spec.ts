// import { test } from '@japa/runner'
// import CardMarketPriceService from '#services/card_market_price_service'
// import { CardFactory } from '#database/factories/card'
// import { DateTime } from 'luxon'
// import testUtils from '@adonisjs/core/services/test_utils'
// import { ArtistFactory } from '#database/factories/artist'
// import { RarityFactory } from '#database/factories/rarity'
// import { LegalityFactory } from '#database/factories/legality'
// import { SetFactory } from '#database/factories/set'
// import { CardMarketPriceFactory } from '#database/factories/card_marker_price'

// test.group('CardMarketPriceService', (group) => {
//   let cardMarketPriceService: CardMarketPriceService

//   group.setup(() => {
//     cardMarketPriceService = new CardMarketPriceService()
//   })

//   group.each.setup(() => testUtils.db().withGlobalTransaction())

//   test('getLastCardMarketPricesByCardId - should return the most recent price for a card', async ({
//     assert,
//   }) => {
//     // Setup required relations
//     await ArtistFactory.create()
//     await RarityFactory.create()
//     await LegalityFactory.create()
//     await SetFactory.merge({ id: 'base1' }).create()

//     const card = await CardFactory.create()

//     const olderDate = DateTime.now().minus({ days: 7 })
//     const recentDate = DateTime.now()

//     await CardMarketPriceFactory.merge([
//       {
//         cardId: card.id,
//         trendPrice: 10.5,
//         reverseHoloTrend: 15.75,
//         updatedAt: olderDate,
//       },
//       {
//         cardId: card.id,
//         trendPrice: 12.0,
//         reverseHoloTrend: 18.0,
//         updatedAt: recentDate,
//       },
//     ]).createMany(2)

//     const result = await cardMarketPriceService.getLastCardMarketPricesByCardId(card.id)

//     assert.exists(result)
//     assert.equal(result?.trendPrice, 12.0)
//     assert.equal(result?.reverseHoloTrend, 18.0)
//     assert.equal(result?.updatedAt.toFormat('yyyy-MM-dd'), recentDate.toFormat('yyyy-MM-dd'))
//   })

//   test('getLastCardMarketPricesByCardId - should return null when card has no prices', async ({
//     assert,
//   }) => {
//     await ArtistFactory.create()
//     await RarityFactory.create()
//     await LegalityFactory.create()
//     await SetFactory.merge({ id: 'base1' }).create()

//     const card = await CardFactory.create()

//     const result = await cardMarketPriceService.getLastCardMarketPricesByCardId(card.id)

//     assert.isNull(result)
//   })

//   test('getLastCardMarketPricesByCardId - should return null for non-existent card', async ({
//     assert,
//   }) => {
//     const nonExistentCardId = 'non-existent-card'

//     const result = await cardMarketPriceService.getLastCardMarketPricesByCardId(nonExistentCardId)

//     assert.isNull(result)
//   })

//   test('getLastCardMarketPricesByCardId - should only return prices for specified card', async ({
//     assert,
//   }) => {
//     await ArtistFactory.create()
//     await RarityFactory.create()
//     await LegalityFactory.create()
//     await SetFactory.merge({ id: 'base1' }).create()

//     const card1 = await CardFactory.create()
//     const card2 = await CardFactory.create()

//     const currentDate = DateTime.now()

//     await CardMarketPriceFactory.merge([
//       {
//         cardId: card1.id,
//         trendPrice: 10.0,
//         reverseHoloTrend: 15.0,
//         updatedAt: currentDate,
//       },
//       {
//         cardId: card2.id,
//         trendPrice: 20.0,
//         reverseHoloTrend: 25.0,
//         updatedAt: currentDate,
//       },
//     ]).createMany(2)

//     const result = await cardMarketPriceService.getLastCardMarketPricesByCardId(card1.id)

//     assert.exists(result)
//     assert.equal(result?.trendPrice, 10.0)
//     assert.equal(result?.reverseHoloTrend, 15.0)
//   })
// })
