// import { test } from '@japa/runner'
// import RarityService from '#services/rarity_service'
// import testUtils from '@adonisjs/core/services/test_utils'
// import { RarityFactory } from '#database/factories/rarity'
// import Rarity from '#models/rarity'

// test.group('RarityService', (group) => {
//   group.each.setup(() => testUtils.db().withGlobalTransaction())

//   let rarityService: RarityService

//   group.setup(() => {
//     rarityService = new RarityService()
//   })

//   test('getAllRarities - should return all rarities ordered by label', async ({ assert }) => {
//     await RarityFactory.create()

//     const result = await rarityService.getAllRarities()

//     assert.equal(result.length, 1)
//     assert.equal(result[0].label, 'Common')
//     assert.instanceOf(result[0], Rarity)
//   })

//   test('getAllRarities - should return empty array when no rarities exist', async ({ assert }) => {
//     const result = await rarityService.getAllRarities()

//     assert.equal(result.length, 0)
//     assert.isArray(result)
//   })

//   test('getAllRarities - should return Rarity model instances', async ({ assert }) => {
//     await RarityFactory.create()

//     const result = await rarityService.getAllRarities()

//     assert.equal(result.length, 1)
//     assert.instanceOf(result[0], Rarity)
//     assert.isTrue(typeof result[0].label === 'string')
//   })
// })
