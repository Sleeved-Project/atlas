import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { SetFactory } from '#database/factories/set'
import SetService from '#services/set_service'
import { ArtistFactory } from '#database/factories/artist'
import { RarityFactory } from '#database/factories/rarity'
import { LegalityFactory } from '#database/factories/legality'

test.group('SetService', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  let setService: SetService

  group.setup(() => {
    setService = new SetService()
  })

  test('getAllSets - should return paginated results with correct fields', async ({ assert }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.createMany(15)

    const result = await setService.getAllSets({ page: 1, limit: 10 })

    assert.equal(result.length, 10)
    assert.equal(result.currentPage, 1)

    const firstSet = result[0].$attributes
    assert.properties(firstSet, ['id', 'imageSymbol', 'imageLogo'])
    assert.isUndefined(firstSet.setName)
    assert.isUndefined(firstSet.number)
  })

  test('getAllSets - should filter by name correctly', async ({ assert }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.merge({ name: 'Base Set' }).create()

    const exactResult = await setService.getAllSets({
      page: 1,
      limit: 10,
      name: 'Base',
    })

    assert.isAtLeast(exactResult.length, 1)

    const partialResult = await setService.getAllSets({
      page: 1,
      limit: 10,
      name: 'Bas',
    })

    assert.isAtLeast(partialResult.length, 1)

    const caseInsensitiveResult = await setService.getAllSets({
      page: 1,
      limit: 10,
      name: 'base',
    })

    assert.isAtLeast(caseInsensitiveResult.length, 1)

    const noMatchResult = await setService.getAllSets({
      page: 1,
      limit: 10,
      name: 'NonExistentSet',
    })

    assert.equal(noMatchResult.length, 0)
  })

  test('getSetDetailById - should return set details with all required fields', async ({
    assert,
  }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.merge({ id: 'base1' }).create()

    const set = await setService.getSetDetailById('base1')
    assert.properties(set.$attributes, [
      'id',
      'name',
      'releaseDate',
      'imageSymbol',
      'imageLogo',
      'total',
    ])
  })

  test('getSetDetailById - should throw NotFoundException for non-existent set', async ({
    assert,
  }) => {
    await assert.rejects(() => setService.getSetDetailById('non-existent-id'), 'Row not found')
  })

  test('getSetDetailById - should respect the selected fields only', async ({ assert }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.merge({ id: 'base1' }).create()

    const set = await setService.getSetDetailById('base1')
    assert.property(set.$attributes, 'id')
    assert.property(set.$attributes, 'imageLogo')
    assert.property(set.$attributes, 'total')
    assert.notProperty(set.$attributes, 'printedTotal')
    assert.notProperty(set.$attributes, 'ptcgoCode')
  })
})
