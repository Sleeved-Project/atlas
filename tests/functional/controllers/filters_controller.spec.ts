import { test } from '@japa/runner'

test.group('Filters controller', () => {
  test('cards - it should return all filter types when specified', async ({ client, assert }) => {
    const response = await client
      .get('/api/v1/filters/cards')
      .qs({ types: ['rarity', 'subtype', 'artist', 'type'] })
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const result = response.body()

    // Le service génère les clés avec une simple ajout de 's'
    assert.property(result, 'raritys')
    assert.property(result, 'subtypes')
    assert.property(result, 'artists')
    assert.property(result, 'types')

    assert.isArray(result.raritys)
    assert.isArray(result.subtypes)
    assert.isArray(result.artists)
    assert.isArray(result.types)

    assert.isAtLeast(result.raritys.length, 1, 'Expected at least one rarity')
    assert.isAtLeast(result.subtypes.length, 1, 'Expected at least one subtype')
    assert.isAtLeast(result.artists.length, 1, 'Expected at least one artist')
    assert.isAtLeast(result.types.length, 1, 'Expected at least one type')
  })

  test('cards - it should return only specified filter types', async ({ client, assert }) => {
    const response = await client
      .get('/api/v1/filters/cards')
      .qs({ types: ['rarity', 'artist'] })
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const result = response.body()

    // Le service génère les clés avec une simple ajout de 's'
    assert.property(result, 'raritys')
    assert.property(result, 'artists')
    assert.notProperty(result, 'subtypes')
    assert.notProperty(result, 'types')
  })

  test('cards - it should handle invalid filter types', async ({ client, assert }) => {
    const response = await client
      .get('/api/v1/filters/cards')
      .qs({ types: ['invalid-type'] })
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(400)

    const result = response.body()
    assert.property(result, 'code')
    assert.equal(result.code, 'E_INVALID_FILTER_TYPE')
    assert.include(result.message, 'invalid-type')
  })

  test('cards - it should return empty object when no types specified', async ({
    client,
    assert,
  }) => {
    const response = await client
      .get('/api/v1/filters/cards')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const result = response.body()
    assert.deepEqual(result, {})
  })

  test('available - it should return all available filter types', async ({ client, assert }) => {
    const response = await client.get('/api/v1/filters/available')

    response.assertStatus(200)

    const result = response.body()

    assert.property(result, 'filters')
    assert.isArray(result.filters)
    assert.lengthOf(result.filters, 4)

    const filterTypes = result.filters.map((filter: any) => filter.type)
    assert.includeMembers(filterTypes, ['artist', 'rarity', 'subtype', 'type'])

    // Vérifier la structure de chaque filtre
    const rarityFilter = result.filters.find((f: any) => f.type === 'rarity')
    assert.property(rarityFilter, 'model')
    assert.property(rarityFilter, 'resultKey')
    assert.equal(rarityFilter.model, 'Rarity')
  })
})
