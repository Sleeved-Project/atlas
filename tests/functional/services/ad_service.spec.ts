// import { AdFactory } from '#database/factories/ad'
// import { ArtistFactory } from '#database/factories/artist'
// import { RarityFactory } from '#database/factories/rarity'
// import { LegalityFactory } from '#database/factories/legality'
// import { SetFactory } from '#database/factories/set'
// import { CardFactory } from '#database/factories/card'
// import { CardFinishFactory, CardFinishBasicFactory } from '#database/factories/card_finish'
// import { AdStatusFactory } from '#database/factories/ad_status'
// import { CardConditionFactory, CardConditionBasicFactory } from '#database/factories/card_condition'
// import AdService from '#services/ad_service'
// import testUtils from '@adonisjs/core/services/test_utils'
// import { test } from '@japa/runner'

// test.group('AdService', (group) => {
//   let adService: AdService

//   group.setup(() => {
//     adService = new AdService()
//   })

//   group.each.setup(() => testUtils.db().withGlobalTransaction())

//   test('listAds - should return paginated ads with correct structure', async ({ assert }) => {
//     await ArtistFactory.create()
//     await RarityFactory.create()
//     await LegalityFactory.create()
//     await SetFactory.merge({ id: 'base1' }).create()
//     const cardFinish = await CardFinishFactory.merge({ id: 1, label: 'Holofoil' }).create()
//     const adStatus = await AdStatusFactory.merge({ id: 1, label: 'Published' }).create()
//     const cardCondition = await CardConditionFactory.merge({ id: 1 }).create()

//     await AdFactory.merge({
//       finishId: cardFinish.id,
//       statusId: adStatus.id,
//       conditionId: cardCondition.id,
//     })
//       .with('card')
//       .with('seller')
//       .createMany(15)

//     const result = await adService.listAds({ page: 1, limit: 10 })

//     assert.properties(result, ['data', 'meta'])
//     assert.isArray(result.data)
//     assert.equal(result.data.length, 10)

//     const firstAd = result.data[0]
//     assert.properties(firstAd, [
//       'id',
//       'originalPrice',
//       'rectoImageUrl',
//       'versoImageUrl',
//       'status',
//       'condition',
//       'finish',
//       'card',
//       'seller',
//       'createdAt',
//       'updatedAt',
//     ])
//   })

//   test('listAds - should handle pagination correctly', async ({ assert }) => {
//     const artist = await ArtistFactory.create()
//     const rarity = await RarityFactory.create()
//     const legality = await LegalityFactory.create()
//     const set = await SetFactory.merge({ id: 'base2' }).create()
//     const cardFinish = await CardFinishFactory.merge({ id: 2, label: 'Holo' }).create()
//     const adStatus = await AdStatusFactory.merge({ id: 2, label: 'Published' }).create()
//     const cardCondition = await CardConditionFactory.merge({ id: 2 }).create()

//     await AdFactory.merge({
//       finishId: cardFinish.id,
//       statusId: adStatus.id,
//       conditionId: cardCondition.id,
//     })
//       .with('card', 1, (card) =>
//         card.merge({
//           artistId: artist.id,
//           rarityId: rarity.id,
//           legalityId: legality.id,
//           setId: set.id,
//         })
//       )
//       .with('seller')
//       .createMany(25)

//     const page1 = await adService.listAds({ page: 1, limit: 10 })
//     const page2 = await adService.listAds({ page: 2, limit: 10 })

//     assert.equal(page1.data.length, 10)
//     assert.equal(page2.data.length, 10)
//     assert.equal(page1.meta.currentPage, 1)
//     assert.equal(page2.meta.currentPage, 2)
//     assert.equal(page1.meta.total, 25)
//   })

//   test('searchAds - should filter ads by card name', async ({ assert }) => {
//     const artist = await ArtistFactory.create()
//     const rarity = await RarityFactory.create()
//     const legality = await LegalityFactory.create()
//     const set = await SetFactory.merge({ id: 'base3' }).create()

//     const condition = await CardConditionBasicFactory.create()
//     const finish = await CardFinishBasicFactory.create()
//     const status = await AdStatusFactory.merge({ id: 3, label: 'Published' }).create()

//     const card1 = await CardFactory.merge({
//       name: 'Pikachu',
//       artistId: artist.id,
//       rarityId: rarity.id,
//       legalityId: legality.id,
//       setId: set.id,
//     }).create()

//     const card2 = await CardFactory.merge({
//       name: 'Charizard',
//       artistId: artist.id,
//       rarityId: rarity.id,
//       legalityId: legality.id,
//       setId: set.id,
//     }).create()

//     await AdFactory.merge({
//       cardId: card1.id,
//       conditionId: condition.id,
//       finishId: finish.id,
//       statusId: status.id,
//     })
//       .with('seller')
//       .create()

//     await AdFactory.merge({
//       cardId: card2.id,
//       conditionId: condition.id,
//       finishId: finish.id,
//       statusId: status.id,
//     })
//       .with('seller')
//       .create()

//     const result = await adService.searchAds({ query: 'pika' })

//     assert.equal(result.data.length, 1)
//     assert.equal(result.data[0].card.name, 'Pikachu')
//   })

//   test('searchAds - should return empty results for non-matching query', async ({ assert }) => {
//     const artist = await ArtistFactory.create()
//     const rarity = await RarityFactory.create()
//     const legality = await LegalityFactory.create()
//     const set = await SetFactory.merge({ id: 'base4' }).create()

//     const condition = await CardConditionBasicFactory.create()
//     const finish = await CardFinishBasicFactory.create()
//     const status = await AdStatusFactory.merge({ id: 4, label: 'Published' }).create()

//     await AdFactory.merge({
//       conditionId: condition.id,
//       finishId: finish.id,
//       statusId: status.id,
//     })
//       .with('card', 1, (card) =>
//         card.merge({
//           artistId: artist.id,
//           rarityId: rarity.id,
//           legalityId: legality.id,
//           setId: set.id,
//         })
//       )
//       .with('seller')
//       .createMany(3)

//     const result = await adService.searchAds({ query: 'nonexistent' })

//     assert.equal(result.data.length, 0)
//   })

//   test('getAdById - should return ad with correct details', async ({ assert }) => {
//     const artist = await ArtistFactory.create()
//     const rarity = await RarityFactory.create()
//     const legality = await LegalityFactory.create()
//     const set = await SetFactory.merge({ id: 'base5' }).create()

//     const condition = await CardConditionBasicFactory.create()
//     const finish = await CardFinishBasicFactory.create()
//     const status = await AdStatusFactory.merge({ id: 5, label: 'Published' }).create()

//     const card = await CardFactory.merge({
//       name: 'Bulbasaur',
//       artistId: artist.id,
//       rarityId: rarity.id,
//       legalityId: legality.id,
//       setId: set.id,
//     }).create()

//     const ad = await AdFactory.merge({
//       cardId: card.id,
//       conditionId: condition.id,
//       finishId: finish.id,
//       statusId: status.id,
//     })
//       .with('seller')
//       .create()

//     const fetchedAd = await adService.getAdById(ad.id)

//     assert.isNotNull(fetchedAd)
//     assert.equal(fetchedAd?.id, ad.id)
//     assert.equal(fetchedAd?.card.name, 'Bulbasaur')
//   })
// })
