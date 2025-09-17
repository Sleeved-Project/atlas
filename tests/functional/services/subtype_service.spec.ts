// import { test } from '@japa/runner'
// import SubtypeService from '#services/subtype_service'
// import testUtils from '@adonisjs/core/services/test_utils'
// import { SubtypeFactory } from '#database/factories/subtype'
// import Subtype from '#models/subtypes'

// test.group('SubtypeService', (group) => {
//   group.each.setup(() => testUtils.db().withGlobalTransaction())

//   let subtypeService: SubtypeService

//   group.setup(() => {
//     subtypeService = new SubtypeService()
//   })

//   test('getAllSubtypes - should return all subtypes ordered by label', async ({ assert }) => {
//     await SubtypeFactory.create()

//     const result = await subtypeService.getAllSubtypes()

//     assert.equal(result.length, 1)
//     assert.equal(result[0].label, 'Basic')
//     assert.instanceOf(result[0], Subtype)
//   })

//   test('getAllSubtypes - should return empty array when no subtypes exist', async ({ assert }) => {
//     const result = await subtypeService.getAllSubtypes()

//     assert.equal(result.length, 0)
//     assert.isArray(result)
//   })

//   test('getAllSubtypes - should return Subtype model instances', async ({ assert }) => {
//     await SubtypeFactory.create()

//     const result = await subtypeService.getAllSubtypes()

//     assert.equal(result.length, 1)
//     assert.instanceOf(result[0], Subtype)
//     assert.isTrue(typeof result[0].label === 'string')
//   })
// })
