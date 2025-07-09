import { test } from '@japa/runner'
import FilterMapper from '#mappers/filter_mapper'
import { ArtistFactory } from '#database/factories/artist'
import { RarityFactory } from '#database/factories/rarity'
import { SubtypeFactory } from '#database/factories/subtype'
import { TypeFactory } from '#database/factories/type'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('FilterMapper', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('toNormalizedFilterCardsOutputDTO - should normalize all filter types correctly', async ({
    assert,
  }) => {
    const artist = await ArtistFactory.merge({ name: 'Ken Sugimori' }).create()
    const rarity = await RarityFactory.merge({ label: 'Common' }).create()
    const subtype = await SubtypeFactory.merge({ label: 'Basic' }).create()
    const type = await TypeFactory.merge({ label: 'Pokémon' }).create()

    const result = FilterMapper.toNormalizedFilterCardsOutputDTO(
      [artist],
      [rarity],
      [subtype],
      [type]
    )

    assert.properties(result, ['artists', 'rarities', 'subtypes', 'types'])

    assert.lengthOf(result.artists, 1)
    assert.properties(result.artists[0], ['id', 'value'])
    assert.equal(result.artists[0].id, artist.id)
    assert.equal(result.artists[0].value, 'Ken Sugimori')

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

  test('toNormalizedFilterCardsOutputDTO - should handle empty arrays', ({ assert }) => {
    const result = FilterMapper.toNormalizedFilterCardsOutputDTO([], [], [], [])

    assert.lengthOf(result.artists, 0)
    assert.lengthOf(result.rarities, 0)
    assert.lengthOf(result.subtypes, 0)
    assert.lengthOf(result.types, 0)
  })

  test('toNormalizedFilterCardsOutputDTO - should handle multiple items', async ({ assert }) => {
    const artists = await ArtistFactory.merge([
      { id: 1, name: 'Ken Sugimori' },
      { id: 2, name: 'Atsuko Nishida' },
    ]).createMany(2)

    const rarities = await RarityFactory.merge([
      { id: 1, label: 'Common' },
      { id: 2, label: 'Rare' },
      { id: 3, label: 'Rare Holo' },
    ]).createMany(3)

    const result = FilterMapper.toNormalizedFilterCardsOutputDTO(artists, rarities, [], [])

    assert.lengthOf(result.artists, 2)
    assert.equal(result.artists[0].id, artists[0].id)
    assert.equal(result.artists[0].value, 'Ken Sugimori')
    assert.equal(result.artists[1].id, artists[1].id)
    assert.equal(result.artists[1].value, 'Atsuko Nishida')

    assert.lengthOf(result.rarities, 3)
    assert.equal(result.rarities[0].id, rarities[0].id)
    assert.equal(result.rarities[0].value, 'Common')
    assert.equal(result.rarities[1].id, rarities[1].id)
    assert.equal(result.rarities[1].value, 'Rare')
    assert.equal(result.rarities[2].id, rarities[2].id)
    assert.equal(result.rarities[2].value, 'Rare Holo')
  })

  test('normalizeArtists - should correctly map name to value', async ({ assert }) => {
    const artists = await ArtistFactory.merge([
      { id: 1, name: 'Mitsuhiro Arita' },
      { id: 2, name: 'Kagemaru Himeno' },
    ]).createMany(2)

    const result = FilterMapper.toNormalizedFilterCardsOutputDTO(artists, [], [], [])

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

    const result = FilterMapper.toNormalizedFilterCardsOutputDTO([], rarities, [], [])

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

    const result = FilterMapper.toNormalizedFilterCardsOutputDTO([], [], subtypes, [])

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

    const result = FilterMapper.toNormalizedFilterCardsOutputDTO([], [], [], types)

    assert.lengthOf(result.types, 3)
    assert.equal(result.types[0].id, types[0].id)
    assert.equal(result.types[0].value, 'Fire')
    assert.equal(result.types[1].id, types[1].id)
    assert.equal(result.types[1].value, 'Water')
    assert.equal(result.types[2].id, types[2].id)
    assert.equal(result.types[2].value, 'Trainer')
  })
})
