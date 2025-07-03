import { test } from '@japa/runner'
import SetService from '#services/set_service'
import testUtils from '@adonisjs/core/services/test_utils'
import { SetFactory } from '#database/factories/set'
import { LegalityFactory } from '#database/factories/legality'
import Set from '#models/set'

test.group('SetService', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  let setService: SetService

  group.setup(() => {
    setService = new SetService()
  })

  test('getAllSets - should return all sets ordered by name', async ({ assert }) => {
    await LegalityFactory.create()
    await SetFactory.create()

    const result = await setService.getAllSets()

    assert.equal(result.length, 1)
    assert.equal(result[0].name, 'Base Set')
    assert.instanceOf(result[0], Set)
  })

  test('getAllSets - should return empty array when no sets exist', async ({ assert }) => {
    const result = await setService.getAllSets()

    assert.equal(result.length, 0)
    assert.isArray(result)
  })

  test('getAllSets - should return Set model instances', async ({ assert }) => {
    await LegalityFactory.create()
    await SetFactory.create()

    const result = await setService.getAllSets()

    assert.equal(result.length, 1)
    assert.instanceOf(result[0], Set)
    assert.isTrue(typeof result[0].name === 'string')
  })
})
