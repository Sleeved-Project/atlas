import { test } from '@japa/runner'
import ArtistService from '#services/artist_service'
import testUtils from '@adonisjs/core/services/test_utils'
import { ArtistFactory } from '#database/factories/artist'
import Artist from '#models/artist'

test.group('ArtistService', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  let artistService: ArtistService

  group.setup(() => {
    artistService = new ArtistService()
  })

  test('getAllArtists - should return all artists ordered by name', async ({ assert }) => {
    await ArtistFactory.create()

    const result = await artistService.getAllArtists()

    assert.equal(result.length, 1)
    assert.equal(result[0].name, 'Artist name')
    assert.instanceOf(result[0], Artist)
  })

  test('getAllArtists - should return empty array when no artists exist', async ({ assert }) => {
    const result = await artistService.getAllArtists()

    assert.equal(result.length, 0)
    assert.isArray(result)
  })

  test('getAllArtists - should return Artist model instances', async ({ assert }) => {
    await ArtistFactory.create()

    const result = await artistService.getAllArtists()

    assert.equal(result.length, 1)
    assert.instanceOf(result[0], Artist)
    assert.isTrue(typeof result[0].name === 'string')
  })
})
