import { test } from '@japa/runner'

test.group('Filters controller', () => {
  test('cards - it should return all filter types when none specified', async ({
    client,
    assert,
  }) => {
    const response = await client
      .get('/api/v1/filters/cards')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const result = response.body()

    assert.property(result, 'rarities')
    assert.property(result, 'subtypes')
    assert.property(result, 'artists')

    assert.isArray(result.rarities)
    assert.isArray(result.subtypes)
    assert.isArray(result.artists)

    assert.isAtLeast(result.rarities.length, 1, 'Expected at least one rarity')
    assert.isAtLeast(result.subtypes.length, 1, 'Expected at least one subtype')
    assert.isAtLeast(result.artists.length, 1, 'Expected at least one artist')
  })

  test('cards - it should return only specified filter types', async ({ client, assert }) => {
    const response = await client
      .get('/api/v1/filters/cards')
      .qs({ types: ['rarity', 'artist'] })
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const result = response.body()

    assert.property(result, 'rarities')
    assert.property(result, 'artists')
    assert.notProperty(result, 'subtypes')
  })

  test('cards - it should validate filter types', async ({ client }) => {
    const response = await client
      .get('/api/v1/filters/cards')
      .qs({ types: ['invalid-type'] })
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(422)
  })
})
