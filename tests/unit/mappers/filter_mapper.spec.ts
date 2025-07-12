import { test } from '@japa/runner'
import FilterMapper from '#mappers/filter_mapper'
import { ArtistFactory, PaginatedArtistFactory } from '#database/factories/artist'
import { RarityFactory } from '#database/factories/rarity'
import { SubtypeFactory } from '#database/factories/subtype'
import { TypeFactory } from '#database/factories/type'
import testUtils from '@adonisjs/core/services/test_utils'
import Artist from '#models/artist'

test.group('FilterMapper', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('toPaginatedFilterCardsOutputDTO - should map all filter types correctly', async ({
    assert,
  }) => {
    await PaginatedArtistFactory.createMany(10)
    const rarity = await RarityFactory.merge({ label: 'Common' }).create()
    const subtype = await SubtypeFactory.merge({ label: 'Basic' }).create()
    const type = await TypeFactory.merge({ label: 'Pokémon' }).create()
    const paginatedArtists = await Artist.query().orderBy('id').paginate(1, 5)

    const result = FilterMapper.toPaginatedFilterCardsOutputDTO(
      paginatedArtists,
      [rarity],
      [subtype],
      [type]
    )

    assert.properties(result, ['artists', 'rarities', 'subtypes', 'types', 'meta'])

    assert.lengthOf(result.artists, 5)
    assert.isArray(result.artists)
    assert.isAtLeast(result.artists.length, 1)

    assert.lengthOf(result.rarities, 1)
    assert.properties(result.rarities[0], ['id', 'value'])
    assert.equal(result.rarities[0].id, rarity.id)
    assert.equal(result.rarities[0].value, 'Common')

    assert.lengthOf(result.subtypes, 1)
    assert.properties(result.subtypes[0], ['id', 'value'])
    assert.equal(result.subtypes[0].id, subtype.id)
    assert.equal(result.subtypes[0].value, 'Basic')

    assert.lengthOf(result.types, 1)
    assert.properties(result.types[0], ['id', 'value'])
    assert.equal(result.types[0].id, type.id)
    assert.equal(result.types[0].value, 'Pokémon')

    assert.isObject(result.meta)
    assert.isNumber(result.meta.total)
    assert.isNumber(result.meta.perPage)
    assert.isNumber(result.meta.currentPage)
    assert.isNumber(result.meta.lastPage)
    assert.isNumber(result.meta.firstPage)
    assert.isString(result.meta.lastPageUrl)
    assert.isString(result.meta.nextPageUrl)
  })

  test('toNormalizedFilterCardsOutputDTO - should normalize all filter types correctly', async ({
    assert,
  }) => {
    await PaginatedArtistFactory.createMany(15)
    const rarity = await RarityFactory.merge({ label: 'Common' }).create()
    const subtype = await SubtypeFactory.merge({ label: 'Basic' }).create()
    const type = await TypeFactory.merge({ label: 'Pokémon' }).create()
    const paginatedArtists = await Artist.query().orderBy('id').paginate(1, 10)

    const result = FilterMapper.toNormalizedFilterCardsOutputDTO(
      paginatedArtists,
      [rarity],
      [subtype],
      [type]
    )

    assert.properties(result, ['artists', 'rarities', 'subtypes', 'types'])

    assert.lengthOf(result.artists, 10)
    assert.properties(result.artists[0], ['id', 'value'])

    assert.lengthOf(result.rarities, 1)
    assert.properties(result.rarities[0], ['id', 'value'])
    assert.equal(result.rarities[0].id, rarity.id)
    assert.equal(result.rarities[0].value, 'Common')

    assert.lengthOf(result.subtypes, 1)
    assert.properties(result.subtypes[0], ['id', 'value'])
    assert.equal(result.subtypes[0].id, subtype.id)
    assert.equal(result.subtypes[0].value, 'Basic')

    assert.lengthOf(result.types, 1)
    assert.properties(result.types[0], ['id', 'value'])
    assert.equal(result.types[0].id, type.id)
    assert.equal(result.types[0].value, 'Pokémon')
  })

  test('toNormalizedFilterCardsOutputDTO - should handle empty arrays', async ({ assert }) => {
    const paginatedArtists = await Artist.query().paginate(1, 10)

    const result = FilterMapper.toNormalizedFilterCardsOutputDTO(paginatedArtists, [], [], [])

    assert.lengthOf(result.artists, 0)
    assert.lengthOf(result.rarities, 0)
    assert.lengthOf(result.subtypes, 0)
    assert.lengthOf(result.types, 0)
  })

  test('normalizeArtists - should correctly map name to value', async ({ assert }) => {
    const artists = await ArtistFactory.merge([
      { id: 1, name: 'Mitsuhiro Arita' },
      { id: 2, name: 'Kagemaru Himeno' },
    ]).createMany(2)
    const paginatedArtists = await Artist.query().orderBy('id').paginate(1, 10)

    const result = FilterMapper.toNormalizedFilterCardsOutputDTO(paginatedArtists, [], [], [])

    assert.lengthOf(result.artists, 2)
    assert.equal(result.artists[0].id, artists[0].id)
    assert.equal(result.artists[0].value, 'Mitsuhiro Arita')
    assert.equal(result.artists[1].id, artists[1].id)
    assert.equal(result.artists[1].value, 'Kagemaru Himeno')
  })

  test('normalizeRarities - should correctly map label to value', async ({ assert }) => {
    const rarities = await RarityFactory.merge([
      { id: 1, label: 'Ultra Rare' },
      { id: 2, label: 'Secret Rare' },
    ]).createMany(2)
    const paginatedArtists = await Artist.query().paginate(1, 10)

    const result = FilterMapper.toNormalizedFilterCardsOutputDTO(paginatedArtists, rarities, [], [])

    assert.lengthOf(result.rarities, 2)
    assert.equal(result.rarities[0].id, rarities[0].id)
    assert.equal(result.rarities[0].value, 'Ultra Rare')
    assert.equal(result.rarities[1].id, rarities[1].id)
    assert.equal(result.rarities[1].value, 'Secret Rare')
  })

  test('normalizeSubtypes - should correctly map label to value', async ({ assert }) => {
    const subtypes = await SubtypeFactory.merge([
      { id: 1, label: 'Stage 1' },
      { id: 2, label: 'Stage 2' },
    ]).createMany(2)
    const paginatedArtists = await Artist.query().paginate(1, 10)

    const result = FilterMapper.toNormalizedFilterCardsOutputDTO(paginatedArtists, [], subtypes, [])

    assert.lengthOf(result.subtypes, 2)
    assert.equal(result.subtypes[0].id, subtypes[0].id)
    assert.equal(result.subtypes[0].value, 'Stage 1')
    assert.equal(result.subtypes[1].id, subtypes[1].id)
    assert.equal(result.subtypes[1].value, 'Stage 2')
  })

  test('normalizeTypes - should correctly map label to value', async ({ assert }) => {
    const types = await TypeFactory.merge([
      { id: 1, label: 'Fire' },
      { id: 2, label: 'Water' },
      { id: 3, label: 'Trainer' },
    ]).createMany(3)
    const paginatedArtists = await Artist.query().paginate(1, 10)

    const result = FilterMapper.toNormalizedFilterCardsOutputDTO(paginatedArtists, [], [], types)

    assert.lengthOf(result.types, 3)
    assert.equal(result.types[0].id, types[0].id)
    assert.equal(result.types[0].value, 'Fire')
    assert.equal(result.types[1].id, types[1].id)
    assert.equal(result.types[1].value, 'Water')
    assert.equal(result.types[2].id, types[2].id)
    assert.equal(result.types[2].value, 'Trainer')
  })
})
