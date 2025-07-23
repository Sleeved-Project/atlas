import { test } from '@japa/runner'
import TypeService from '#services/type_service'
import testUtils from '@adonisjs/core/services/test_utils'
import { TypeFactory } from '#database/factories/type'
import Type from '#models/type'

test.group('TypeService', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  let typeService: TypeService

  group.setup(() => {
    typeService = new TypeService()
  })

  test('getAllTypes - should return all types ordered by label', async ({ assert }) => {
    await TypeFactory.create()

    const result = await typeService.getAllTypes()

    assert.equal(result.length, 1)
    assert.equal(result[0].label, 'Psy')
    assert.instanceOf(result[0], Type)
  })

  test('getAllTypes - should return empty array when no types exist', async ({ assert }) => {
    const result = await typeService.getAllTypes()

    assert.equal(result.length, 0)
    assert.isArray(result)
  })

  test('getAllTypes - should return Type model instances', async ({ assert }) => {
    await TypeFactory.create()

    const result = await typeService.getAllTypes()

    assert.equal(result.length, 1)
    assert.instanceOf(result[0], Type)
    assert.isTrue(typeof result[0].label === 'string')
  })
})
