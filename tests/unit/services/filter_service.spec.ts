import { test } from '@japa/runner'
import FilterService from '#services/filter_service'
import InvalidFilterException from '#exceptions/invalid_filter_exception'

test.group('FilterService', () => {
  test('should throw InvalidFilterException for unknown filter type', async ({ assert }) => {
    const filterService = new FilterService()

    const filterData = { types: ['unknown_type'] }

    try {
      await filterService.getCardFilters(filterData)
      assert.fail('Should have thrown InvalidFilterException')
    } catch (error) {
      assert.instanceOf(error, InvalidFilterException)
      assert.include(error.message, 'unknown_type')
      assert.include(error.message, 'Available types: artist, rarity, subtype, type')
    }
  })

  test('should return available filter types', async ({ assert }) => {
    const filterService = new FilterService()

    const availableTypes = filterService.getAvailableFilterTypes()

    assert.isArray(availableTypes)
    assert.lengthOf(availableTypes, 4)

    const types = availableTypes.map((item) => item.type)
    assert.includeMembers(types, ['artist', 'rarity', 'subtype', 'type'])
  })
})
