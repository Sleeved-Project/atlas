// import { test } from '@japa/runner'
// import CardMarketPriceMapper from '#mappers/card_market_price_mapper'
// import CardMarketPrice from '#models/card_market_price'
// import CardFinish from '#models/card_finish'
// import CardCondition from '#models/card_condition'
// import { CardFinishType } from '#types/card_finish_type'
// import PriceUtils from '#utils/price_utils'

// test.group('CardMarketPriceMapper', () => {
//   test('toCardAdvicePriceOutputDTO - should return unknown for null cardMarketPrice', ({
//     assert,
//   }) => {
//     const cardFinish = new CardFinish()
//     const cardCondition = new CardCondition()

//     const result = CardMarketPriceMapper.toCardAdvicePriceOutputDTO(null, cardFinish, cardCondition)

//     assert.equal(result, PriceUtils.UNKNOWN_PRICE)
//   })

//   test('toCardAdvicePriceOutputDTO - should calculate correct price for holofoil cards', ({
//     assert,
//   }) => {
//     const cardMarketPrice = new CardMarketPrice()
//     cardMarketPrice.reverseHoloTrend = 10.0

//     const cardFinish = new CardFinish()
//     cardFinish.label = CardFinishType.HOLOFOIL

//     const cardCondition = new CardCondition()
//     cardCondition.percentPriceAlteration = 25 // +25%

//     const result = CardMarketPriceMapper.toCardAdvicePriceOutputDTO(
//       cardMarketPrice,
//       cardFinish,
//       cardCondition
//     )

//     assert.equal(result, '12.50') // 10.0 * 1.25
//   })

//   test('toCardAdvicePriceOutputDTO - should calculate correct price for normal cards', ({
//     assert,
//   }) => {
//     const cardMarketPrice = new CardMarketPrice()
//     cardMarketPrice.trendPrice = 10.0

//     const cardFinish = new CardFinish()
//     cardFinish.label = CardFinishType.NORMAL

//     const cardCondition = new CardCondition()
//     cardCondition.percentPriceAlteration = -50 // -50%

//     const result = CardMarketPriceMapper.toCardAdvicePriceOutputDTO(
//       cardMarketPrice,
//       cardFinish,
//       cardCondition
//     )

//     assert.equal(result, '5.00') // 10.0 * 0.5
//   })

//   test('toCardAdvicePriceOutputDTO - should return unknown when price is not available', ({
//     assert,
//   }) => {
//     const cardMarketPrice = new CardMarketPrice()
//     // Pas de prix défini

//     const cardFinish = new CardFinish()
//     cardFinish.label = CardFinishType.NORMAL

//     const cardCondition = new CardCondition()
//     cardCondition.percentPriceAlteration = 0

//     const result = CardMarketPriceMapper.toCardAdvicePriceOutputDTO(
//       cardMarketPrice,
//       cardFinish,
//       cardCondition
//     )

//     assert.equal(result, PriceUtils.UNKNOWN_PRICE)
//   })

//   test('toCardAdvicePriceOutputDTO - should handle invalid finish type', ({ assert }) => {
//     const cardMarketPrice = new CardMarketPrice()
//     cardMarketPrice.trendPrice = 10.0

//     const cardFinish = new CardFinish()
//     cardFinish.label = 'invalid' as CardFinishType

//     const cardCondition = new CardCondition()
//     cardCondition.percentPriceAlteration = 0

//     const result = CardMarketPriceMapper.toCardAdvicePriceOutputDTO(
//       cardMarketPrice,
//       cardFinish,
//       cardCondition
//     )

//     assert.equal(result, PriceUtils.UNKNOWN_PRICE)
//   })
// })
