import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { AdFactory } from '#database/factories/ad'
import AdService from '#services/ad_service'

test.group('AdService', (group) => {
  let adService: AdService

  group.setup(() => {
    adService = new AdService()
  })

  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('listAds - it should return paginated ads with default pagination', async ({ assert }) => {
    await AdFactory.with('card')
      .with('seller')
      .with('condition')
      .with('finish')
      .with('status')
      .createMany(3)

    const result = await adService.listAds({})

    assert.properties(result, ['data', 'meta'])
    assert.equal(result.data.length, 3)
    assert.equal(result.meta.total, 3)
    assert.equal(result.meta.perPage, 20)
    assert.equal(result.meta.currentPage, 1)
  })

  test('listAds - it should apply pagination parameters', async ({ assert }) => {
    await AdFactory.with('card')
      .with('seller')
      .with('condition')
      .with('finish')
      .with('status')
      .createMany(10)

    const result = await adService.listAds({ page: 2, limit: 3 })

    assert.equal(result.data.length, 3)
    assert.equal(result.meta.total, 10)
    assert.equal(result.meta.perPage, 3)
    assert.equal(result.meta.currentPage, 2)
  })

  test('listAds - it should preload all relationships', async ({ assert }) => {
    await AdFactory.with('card')
      .with('seller')
      .with('condition')
      .with('finish')
      .with('status')
      .create()

    const result = await adService.listAds({})
    const ad = result.data[0]

    assert.isObject(ad.card)
    assert.isObject(ad.seller)
    assert.isObject(ad.condition)
    assert.isObject(ad.finish)
    assert.isObject(ad.status)
    assert.property(ad, 'certificate')
  })

  test('listAds - it should return empty result when no ads exist', async ({ assert }) => {
    const result = await adService.listAds({})

    assert.equal(result.data.length, 0)
    assert.equal(result.meta.total, 0)
  })
})
