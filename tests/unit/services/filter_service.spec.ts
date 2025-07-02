import { ArtistFactory } from '#database/factories/artist'
import { LegalityFactory } from '#database/factories/legality'
import { SetFactory } from '#database/factories/set'
import { TypeFactory } from '#database/factories/type'
import InvalidFilterException from '#exceptions/invalid_filter_exception'
import FilterService from '#services/filter_service'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

test.group('FilterService', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('getCardFilters - should return all filter types when no types specified', async ({
    assert,
  }) => {
    const filterService = new FilterService()

    const result = await filterService.getCardFilters({})

    assert.isObject(result)
    assert.properties(result, ['artists', 'raritys', 'subtypes', 'types', 'sets'])

    assert.isArray(result.artists)
    assert.isArray(result.raritys)
    assert.isArray(result.subtypes)
    assert.isArray(result.types)
    assert.isArray(result.sets)
  })

  test('getCardFilters - should throw InvalidFilterException for unknown filter type', async ({
    assert,
  }) => {
    const filterService = new FilterService()

    try {
      await filterService.getCardFilters({ types: ['unknown_type'] })
      assert.fail('Should have thrown InvalidFilterException')
    } catch (error) {
      assert.instanceOf(error, InvalidFilterException)
      assert.include(error.message, 'unknown_type')
      assert.include(error.message, 'Available types: artist, rarity, subtype, type, set')
    }
  })

  test('getCardFilters - should return data with expected properties', async ({ assert }) => {
    await ArtistFactory.create()

    const filterService = new FilterService()
    const result = await filterService.getCardFilters({ types: ['artist'] })

    assert.isAtLeast(result.artists.length, 1)

    const artist = result.artists[0]

    assert.exists(artist.id, 'Artist should have an id')
    assert.exists(artist.name, 'Artist should have a name')

    assert.isNumber(artist.id)
    assert.isString(artist.name)

    assert.isAbove(artist.id, 0)
    assert.isNotEmpty(artist.name)
  })

  test('getCardFilters - should respond quickly', async ({ assert }) => {
    await LegalityFactory.create()
    await TypeFactory.create()
    await SetFactory.create()

    const filterService = new FilterService()

    const start = Date.now()
    await filterService.getCardFilters({})
    const duration = Date.now() - start

    assert.isBelow(duration, 2000)
  })
})
