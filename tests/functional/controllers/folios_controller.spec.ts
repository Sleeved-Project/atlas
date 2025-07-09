import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import sinon from 'sinon'
import { FolioFactory } from '#database/factories/folio'
import AuthServiceMock, { TEST_AUTH_USER_ID } from '#tests/mocks/auth_service_mock'
import { CardFactory } from '#database/factories/card'
import { CardFolioFactory } from '#database/factories/card_folio'
import { ArtistFactory } from '#database/factories/artist'
import { RarityFactory } from '#database/factories/rarity'
import { LegalityFactory } from '#database/factories/legality'
import { SetFactory } from '#database/factories/set'
import { DateTime } from 'luxon'

test.group('Folio controller', (group) => {
  let wardenApiClientStub: sinon.SinonStub

  group.setup(() => {
    wardenApiClientStub = AuthServiceMock.setupWardenApiClientStub()
  })

  group.each.setup(() => testUtils.db().withGlobalTransaction())

  group.teardown(() => {
    wardenApiClientStub.restore()
  })

  test('init - it should create a main folio for a user', async ({ client, assert }) => {
    const response = await client
      .post('/api/v1/folios/init')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)
    assert.properties(response.body(), ['message'])
  })

  test('init - it should not create duplicate main folio', async ({ client, assert }) => {
    await FolioFactory.merge({
      userId: '123',
      isRoot: true,
    }).create()

    const response = await client
      .post('/api/v1/folios/init')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(409)
    assert.properties(response.body(), ['code', 'message'])
  })

  test('init - it should require authentication', async ({ client }) => {
    const response = await client.post('/api/v1/folios/init')
    response.assertStatus(401)
  })

  test('show - should return folio details with statistics and trending', async ({
    client,
    assert,
  }) => {
    const userId = TEST_AUTH_USER_ID

    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.merge({ id: 'base1' }).create()

    const childFolio = await FolioFactory.merge({
      userId,
      name: 'My Custom Collection',
      image: 'custom.jpg',
      isRoot: false,
    }).create()

    const todayCards = await CardFactory.with('cardMarketPrices', 1, (cardMarketPrices) =>
      cardMarketPrices.merge({
        trendPrice: 15.0,
        updatedAt: DateTime.now(),
      })
    )
      .with('tcgPlayerReportings', 1, (tcgPlayerReportings) =>
        tcgPlayerReportings
          .merge({ updatedAt: DateTime.now() })
          .with('tcgPlayerPrices', 1, (tcgPlayerPrices) =>
            tcgPlayerPrices.merge({ type: 'normal', market: 12.0 })
          )
      )
      .createMany(2)

    await CardFolioFactory.merge([
      { cardId: todayCards[0].id, folioId: childFolio.id, occurrence: 2 },
      { cardId: todayCards[1].id, folioId: childFolio.id, occurrence: 1 },
    ]).createMany(2)

    const response = await client
      .get(`/api/v1/folios/${childFolio.id}`)
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const folio = response.body()
    assert.properties(folio, ['id', 'name', 'image', 'createdAt', 'statistics'])
    assert.properties(folio.statistics, [
      'totalCardsCount',
      'cardMarketPrice',
      'tcgPlayerPrice',
      'cardMarketTrending',
      'tcgPlayerTrending',
    ])

    assert.equal(folio.id, childFolio.id)
    assert.equal(folio.name, 'My Custom Collection')
    assert.equal(folio.image, 'custom.jpg')
    assert.exists(folio.createdAt)
    assert.equal(folio.statistics.totalCardsCount, 3) // 2 + 1 occurrences
    assert.equal(folio.statistics.cardMarketPrice, '45.00') // (15*2) + (15*1)
    assert.equal(folio.statistics.tcgPlayerPrice, '36.00') // (12*2) + (12*1)
    assert.oneOf(folio.statistics.cardMarketTrending, ['up', 'down', 'equal'])
    assert.oneOf(folio.statistics.tcgPlayerTrending, ['up', 'down', 'equal'])
  })

  test('show - should return 403 when folio is not owned by user', async ({ client }) => {
    const otherUserId = 'other-user-id'

    const otherUserFolio = await FolioFactory.merge({
      userId: otherUserId,
      name: 'Other User Collection',
      isRoot: false,
    }).create()

    const response = await client
      .get(`/api/v1/folios/${otherUserFolio.id}`)
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(403)
    response.assertBodyContains({
      code: 'E_FOLIO_NOT_OWNED',
    })
  })

  test('show - should return 422 when trying to access main folio', async ({ client }) => {
    const userId = TEST_AUTH_USER_ID

    const mainFolio = await FolioFactory.merge({
      userId,
      name: 'root',
      isRoot: true,
    }).create()

    const response = await client
      .get(`/api/v1/folios/${mainFolio.id}`)
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(422)
    response.assertBodyContains({
      code: 'E_NOT_CHILD_FOLIO',
    })
  })

  test('show - should return 404 when folio does not exist', async ({ client }) => {
    const nonExistentFolioId = 'non-existent-folio-id'

    const response = await client
      .get(`/api/v1/folios/${nonExistentFolioId}`)
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(404)
    response.assertBodyContains({
      code: 'E_ROW_NOT_FOUND',
    })
  })

  test('show - should handle folio without cards', async ({ client, assert }) => {
    const userId = TEST_AUTH_USER_ID

    const emptyFolio = await FolioFactory.merge({
      userId,
      name: 'Empty Collection',
      image: 'empty.jpg',
      isRoot: false,
    }).create()

    const response = await client
      .get(`/api/v1/folios/${emptyFolio.id}`)
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const folio = response.body()
    assert.equal(folio.id, emptyFolio.id)
    assert.equal(folio.name, 'Empty Collection')
    assert.equal(folio.image, 'empty.jpg')
    assert.equal(folio.statistics.totalCardsCount, 0)
    assert.equal(folio.statistics.cardMarketPrice, '0.00')
    assert.equal(folio.statistics.tcgPlayerPrice, '0.00')
    assert.equal(folio.statistics.cardMarketTrending, 'equal')
    assert.equal(folio.statistics.tcgPlayerTrending, 'equal')
  })

  test('show - should require authentication', async ({ client }) => {
    const folio = await FolioFactory.merge({
      isRoot: false,
    }).create()

    const response = await client.get(`/api/v1/folios/${folio.id}`)

    response.assertStatus(401)
  })

  test('show - should include trending comparison with yesterday prices', async ({
    client,
    assert,
  }) => {
    const userId = TEST_AUTH_USER_ID

    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.merge({ id: 'base1' }).create()

    const childFolio = await FolioFactory.merge({
      userId,
      name: 'Trending Collection',
      isRoot: false,
    }).create()

    // Today: higher prices
    const todayCard = await CardFactory.with('cardMarketPrices', 1, (cardMarketPrices) =>
      cardMarketPrices.merge({
        trendPrice: 20.0,
        updatedAt: DateTime.now(),
      })
    )
      .with('tcgPlayerReportings', 1, (tcgPlayerReportings) =>
        tcgPlayerReportings
          .merge({ updatedAt: DateTime.now() })
          .with('tcgPlayerPrices', 1, (tcgPlayerPrices) =>
            tcgPlayerPrices.merge({ type: 'normal', market: 15.0 })
          )
      )
      .create()

    // Yesterday: lower prices
    const yesterdayCard = await CardFactory.with('cardMarketPrices', 1, (cardMarketPrices) =>
      cardMarketPrices.merge({
        trendPrice: 10.0,
        updatedAt: DateTime.now().minus({ days: 1 }),
      })
    )
      .with('tcgPlayerReportings', 1, (tcgPlayerReportings) =>
        tcgPlayerReportings
          .merge({ updatedAt: DateTime.now().minus({ days: 1 }) })
          .with('tcgPlayerPrices', 1, (tcgPlayerPrices) =>
            tcgPlayerPrices.merge({ type: 'normal', market: 8.0 })
          )
      )
      .create()

    await CardFolioFactory.merge([
      { cardId: todayCard.id, folioId: childFolio.id, occurrence: 1 },
      { cardId: yesterdayCard.id, folioId: childFolio.id, occurrence: 1 },
    ]).createMany(2)

    const response = await client
      .get(`/api/v1/folios/${childFolio.id}`)
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const folio = response.body()
    assert.equal(folio.statistics.cardMarketTrending, 'up') // 20 > 10
    assert.equal(folio.statistics.tcgPlayerTrending, 'up') // 15 > 8
  })
})
