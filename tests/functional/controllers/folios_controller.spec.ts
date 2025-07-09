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

  test('statistics - should return folio statistics with correct structure', async ({
    client,
    assert,
  }) => {
    const userId = TEST_AUTH_USER_ID

    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.merge({ id: 'base1' }).create()

    const mainFolio = await FolioFactory.merge({
      userId,
      isRoot: true,
    }).create()

    const todayCards = await CardFactory.with('cardMarketPrices', 1, (cardMarketPrices) =>
      cardMarketPrices.merge({
        trendPrice: 10.5,
        reverseHoloTrend: 15.75,
        updatedAt: DateTime.now(),
      })
    )
      .with('tcgPlayerReportings', 1, (tcgPlayerReportings) =>
        tcgPlayerReportings
          .merge({
            updatedAt: DateTime.now(),
          })
          .with('tcgPlayerPrices', 2, (tcgPlayerPrices) =>
            tcgPlayerPrices.merge([
              { type: 'normal', market: 12.0 },
              { type: 'holofoil', market: 18.5 },
            ])
          )
      )
      .createMany(3)

    await CardFolioFactory.merge([
      { cardId: todayCards[0].id, folioId: mainFolio.id, occurrence: 2 },
      { cardId: todayCards[1].id, folioId: mainFolio.id, occurrence: 1 },
      { cardId: todayCards[2].id, folioId: mainFolio.id, occurrence: 3 },
    ]).createMany(3)

    const response = await client
      .get('/api/v1/folios/statistics')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const statistics = response.body()
    assert.properties(statistics, [
      'totalCardsCount',
      'cardMarketPrice',
      'tcgPlayerPrice',
      'cardMarketTrending',
      'tcgPlayerTrending',
    ])

    assert.isNumber(statistics.totalCardsCount)
    assert.isString(statistics.cardMarketPrice)
    assert.isString(statistics.tcgPlayerPrice)
    assert.isString(statistics.cardMarketTrending)
    assert.isString(statistics.tcgPlayerTrending)

    assert.equal(statistics.totalCardsCount, 6) // 2 + 1 + 3 occurrences
    assert.match(statistics.cardMarketPrice, /^\d+(\.\d{2})?$/) // Format prix: "10.50"
    assert.match(statistics.tcgPlayerPrice, /^\d+(\.\d{2})?$/)
    assert.oneOf(statistics.cardMarketTrending, ['up', 'down', 'equal'])
    assert.oneOf(statistics.tcgPlayerTrending, ['up', 'down', 'equal'])
  })

  test('statistics - should handle cards without recent prices', async ({ client, assert }) => {
    const userId = TEST_AUTH_USER_ID

    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.merge({ id: 'base1' }).create()

    const mainFolio = await FolioFactory.merge({
      userId,
      isRoot: true,
    }).create()

    const cardsWithoutPrices = await CardFactory.createMany(2)

    await CardFolioFactory.merge([
      { cardId: cardsWithoutPrices[0].id, folioId: mainFolio.id, occurrence: 1 },
      { cardId: cardsWithoutPrices[1].id, folioId: mainFolio.id, occurrence: 2 },
    ]).createMany(2)

    const response = await client
      .get('/api/v1/folios/statistics')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const statistics = response.body()
    assert.equal(statistics.totalCardsCount, 3) // 1 + 2 occurrences
    assert.equal(statistics.cardMarketPrice, '0.00')
    assert.equal(statistics.tcgPlayerPrice, '0.00')
    assert.equal(statistics.cardMarketTrending, 'equal')
    assert.equal(statistics.tcgPlayerTrending, 'equal')
  })

  test('statistics - should only include cards from main folio', async ({ client, assert }) => {
    const userId1 = TEST_AUTH_USER_ID
    const userId2 = 'other-user-id'

    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.merge({ id: 'base1' }).create()

    const mainFolio1 = await FolioFactory.merge({
      userId: userId1,
      isRoot: true,
    }).create()

    const mainFolio2 = await FolioFactory.merge({
      userId: userId2,
      isRoot: true,
    }).create()

    const secondaryFolio1 = await FolioFactory.merge({
      userId: userId1,
      isRoot: false,
    }).create()

    const cards = await CardFactory.with('cardMarketPrices', 1, (cardMarketPrices) =>
      cardMarketPrices.merge({
        trendPrice: 10.0,
        updatedAt: DateTime.now(),
      })
    ).createMany(4)

    await CardFolioFactory.merge([
      { cardId: cards[0].id, folioId: mainFolio1.id, occurrence: 1 },
      { cardId: cards[1].id, folioId: mainFolio1.id, occurrence: 2 },
    ]).createMany(2)

    await CardFolioFactory.merge({
      cardId: cards[2].id,
      folioId: mainFolio2.id,
      occurrence: 1,
    }).create()

    await CardFolioFactory.merge({
      cardId: cards[3].id,
      folioId: secondaryFolio1.id,
      occurrence: 1,
    }).create()

    const response = await client
      .get('/api/v1/folios/statistics')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const statistics = response.body()
    assert.equal(statistics.totalCardsCount, 3) // Only cards from user1's main folio: 1 + 2
    assert.equal(statistics.cardMarketPrice, '30.00') // 3 cards × 10.0 each
  })

  test('statistics - should return 404 when user has no main folio', async ({ client }) => {
    const response = await client
      .get('/api/v1/folios/statistics')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(404)
    response.assertBodyContains({
      code: 'E_ROW_NOT_FOUND',
    })
  })

  test('statistics - should require authentication', async ({ client }) => {
    const response = await client.get('/api/v1/folios/statistics')

    response.assertStatus(401)
  })

  test('statistics - should handle empty folio correctly', async ({ client, assert }) => {
    const userId = TEST_AUTH_USER_ID

    await FolioFactory.merge({
      userId,
      isRoot: true,
    }).create()

    const response = await client
      .get('/api/v1/folios/statistics')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const statistics = response.body()
    assert.equal(statistics.totalCardsCount, 0)
    assert.equal(statistics.cardMarketPrice, '0.00')
    assert.equal(statistics.tcgPlayerPrice, '0.00')
    assert.equal(statistics.cardMarketTrending, 'equal')
    assert.equal(statistics.tcgPlayerTrending, 'equal')
  })

  test('statistics - should properly aggregate card occurrences in calculations', async ({
    client,
    assert,
  }) => {
    const userId = TEST_AUTH_USER_ID

    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.merge({ id: 'base1' }).create()

    const mainFolio = await FolioFactory.merge({
      userId,
      isRoot: true,
    }).create()

    const card = await CardFactory.with('cardMarketPrices', 1, (cardMarketPrices) =>
      cardMarketPrices.merge({
        trendPrice: 10.0,
        updatedAt: DateTime.now(),
      })
    ).create()

    await CardFolioFactory.merge({
      cardId: card.id,
      folioId: mainFolio.id,
      occurrence: 5,
    }).create()

    const response = await client
      .get('/api/v1/folios/statistics')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const statistics = response.body()
    assert.equal(statistics.totalCardsCount, 5) // Should count all occurrences
    assert.equal(statistics.cardMarketPrice, '50.00') // 5 cards × 10.0 each
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

  test('childFolioCards - should return paginated cards from specific child folio', async ({
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
      isRoot: false,
    }).create()

    const otherChildFolio = await FolioFactory.merge({
      userId,
      name: 'Other Collection',
      isRoot: false,
    }).create()

    const cards = await CardFactory.createMany(3)

    // Add cards to target child folio
    await CardFolioFactory.merge([
      { cardId: cards[0].id, folioId: childFolio.id, occurrence: 2 },
      { cardId: cards[1].id, folioId: childFolio.id, occurrence: 1 },
    ]).createMany(2)

    // Add card to other folio (should not be returned)
    await CardFolioFactory.merge({
      cardId: cards[2].id,
      folioId: otherChildFolio.id,
      occurrence: 3,
    }).create()

    const response = await client
      .get(`/api/v1/folios/${childFolio.id}/cards`)
      .header('Authorization', 'Bearer fake-token-for-testing')
      .qs({ page: 1, limit: 10 })

    response.assertStatus(200)

    const body = response.body()
    assert.properties(body, ['meta', 'data'])
    assert.properties(body.meta, ['total', 'currentPage', 'perPage'])
    assert.equal(body.meta.total, 2)
    assert.equal(body.meta.currentPage, 1)

    assert.isArray(body.data)
    assert.lengthOf(body.data, 2)

    const firstCardFolio = body.data[0]
    assert.properties(firstCardFolio, ['id', 'occurrence', 'card'])
    assert.properties(firstCardFolio.card, ['id', 'imageSmall'])

    const cardIds = body.data.map((cardFolio: any) => cardFolio.card.id)
    assert.includeMembers(cardIds, [cards[0].id, cards[1].id])
    assert.notInclude(cardIds, cards[2].id) // Should not include card from other folio

    const cardFolioWithOccurrence2 = body.data.find((cf: any) => cf.card.id === cards[0].id)
    const cardFolioWithOccurrence1 = body.data.find((cf: any) => cf.card.id === cards[1].id)

    assert.equal(cardFolioWithOccurrence2.occurrence, 2)
    assert.equal(cardFolioWithOccurrence1.occurrence, 1)
  })

  test('childFolioCards - should return 403 when folio is not owned by user', async ({
    client,
  }) => {
    const otherUserId = 'other-user-id'

    const otherUserFolio = await FolioFactory.merge({
      userId: otherUserId,
      name: 'Other User Collection',
      isRoot: false,
    }).create()

    const response = await client
      .get(`/api/v1/folios/${otherUserFolio.id}/cards`)
      .header('Authorization', 'Bearer fake-token-for-testing')
      .qs({ page: 1, limit: 10 })

    response.assertStatus(403)
    response.assertBodyContains({
      code: 'E_FOLIO_NOT_OWNED',
    })
  })

  test('childFolioCards - should return 422 when trying to access main folio cards', async ({
    client,
  }) => {
    const userId = TEST_AUTH_USER_ID

    const mainFolio = await FolioFactory.merge({
      userId,
      name: 'root',
      isRoot: true,
    }).create()

    const response = await client
      .get(`/api/v1/folios/${mainFolio.id}/cards`)
      .header('Authorization', 'Bearer fake-token-for-testing')
      .qs({ page: 1, limit: 10 })

    response.assertStatus(422)
    response.assertBodyContains({
      code: 'E_NOT_CHILD_FOLIO',
    })
  })
})
