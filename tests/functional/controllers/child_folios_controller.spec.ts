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
import Folio from '#models/folio'
import CardFolio from '#models/card_folio'
import { UserFactory } from '#database/factories/user'

test.group('Child Folio controller', (group) => {
  let wardenApiClientStub: sinon.SinonStub

  group.setup(() => {
    wardenApiClientStub = AuthServiceMock.setupWardenApiClientStub()
  })

  group.each.setup(() => testUtils.db().withGlobalTransaction())

  group.teardown(() => {
    wardenApiClientStub.restore()
  })

  test('index - should return all child folios with statistics', async ({ client, assert }) => {
    const userId = TEST_AUTH_USER_ID

    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.merge({ id: 'base1' }).create()

    const childFolio1 = await FolioFactory.merge({
      userId,
      name: 'Collection 1',
      image: 'image1.jpg',
      isRoot: false,
    }).create()

    const childFolio2 = await FolioFactory.merge({
      userId,
      name: 'Collection 2',
      image: 'image2.jpg',
      isRoot: false,
    }).create()

    const cards = await CardFactory.with('cardMarketPrices', 1, (cardMarketPrices) =>
      cardMarketPrices.merge({
        trendPrice: 10.0,
        updatedAt: DateTime.now(),
      })
    )
      .with('tcgPlayerReportings', 1, (tcgPlayerReportings) =>
        tcgPlayerReportings
          .merge({ updatedAt: DateTime.now() })
          .with('tcgPlayerPrices', 1, (tcgPlayerPrices) =>
            tcgPlayerPrices.merge({ type: 'normal', market: 8.0 })
          )
      )
      .createMany(3)

    await CardFolioFactory.merge([
      { cardId: cards[0].id, folioId: childFolio1.id, occurrence: 2 },
      { cardId: cards[1].id, folioId: childFolio1.id, occurrence: 1 },
      { cardId: cards[2].id, folioId: childFolio2.id, occurrence: 3 },
    ]).createMany(3)

    const response = await client
      .get('/api/v1/folios')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const folios = response.body()
    assert.isArray(folios)
    assert.lengthOf(folios, 2)

    const folio1 = folios.find((f: Folio) => f.name === childFolio1.name)
    const folio2 = folios.find((f: Folio) => f.name === childFolio2.name)

    assert.exists(folio1)
    assert.exists(folio2)

    assert.properties(folio1, ['id', 'name', 'image', 'statistics'])
    assert.properties(folio1.statistics, ['totalCardsCount', 'cardMarketPrice', 'tcgPlayerPrice'])

    assert.equal(folio1.name, 'Collection 1')
    assert.equal(folio1.image, 'image1.jpg')
    assert.equal(folio1.statistics.totalCardsCount, 3) // 2 + 1 occurrences
    assert.equal(folio1.statistics.cardMarketPrice, '30.00') // (10*2) + (10*1)
    assert.equal(folio1.statistics.tcgPlayerPrice, '24.00') // (8*2) + (8*1)

    assert.equal(folio2.statistics.totalCardsCount, 3) // 3 occurrences
    assert.equal(folio2.statistics.cardMarketPrice, '30.00') // 10*3
    assert.equal(folio2.statistics.tcgPlayerPrice, '24.00') // 8*3
  })

  test('index - should return empty array when user has no child folios', async ({
    client,
    assert,
  }) => {
    const userId = TEST_AUTH_USER_ID

    // Create only main folio
    await FolioFactory.merge({
      userId,
      name: 'root',
      isRoot: true,
    }).create()

    const response = await client
      .get('/api/v1/folios')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const folios = response.body()
    assert.isArray(folios)
    assert.lengthOf(folios, 0)
  })

  test('index - should only return child folios, not main folio', async ({ client, assert }) => {
    const userId = TEST_AUTH_USER_ID

    await FolioFactory.merge({
      userId,
      name: 'root',
      isRoot: true,
    }).create()

    await FolioFactory.merge({
      userId,
      name: 'Custom Collection',
      isRoot: false,
    }).create()

    const response = await client
      .get('/api/v1/folios')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const folios = response.body()
    assert.isArray(folios)
    assert.lengthOf(folios, 1)
    assert.equal(folios[0].name, 'Custom Collection')
  })

  test('index - should only return folios for authenticated user', async ({ client, assert }) => {
    const userId = TEST_AUTH_USER_ID
    const otherUserId = 'other-user-id'

    await UserFactory.merge({
      id: otherUserId,
      username: 'other-test-user',
    }).create()

    await FolioFactory.merge({
      userId,
      name: 'My Collection',
      isRoot: false,
    }).create()

    await FolioFactory.merge({
      userId: otherUserId,
      name: 'Other User Collection',
      isRoot: false,
    }).create()

    const response = await client
      .get('/api/v1/folios')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const folios = response.body()
    assert.isArray(folios)
    assert.lengthOf(folios, 1)
    assert.equal(folios[0].name, 'My Collection')
  })

  test('index - should handle folios without cards', async ({ client, assert }) => {
    const userId = TEST_AUTH_USER_ID

    await FolioFactory.merge({
      userId,
      name: 'Empty Collection',
      image: 'empty.jpg',
      isRoot: false,
    }).create()

    const response = await client
      .get('/api/v1/folios')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const folios = response.body()
    assert.isArray(folios)
    assert.lengthOf(folios, 1)

    const folio = folios[0]
    assert.equal(folio.name, 'Empty Collection')
    assert.equal(folio.image, 'empty.jpg')
    assert.equal(folio.statistics.totalCardsCount, 0)
    assert.equal(folio.statistics.cardMarketPrice, '0.00')
    assert.equal(folio.statistics.tcgPlayerPrice, '0.00')
  })

  test('index - should return folios ordered by creation date desc', async ({ client, assert }) => {
    const userId = TEST_AUTH_USER_ID

    await FolioFactory.merge({
      userId,
      name: 'First Collection',
      isRoot: false,
      createdAt: DateTime.now().minus({ days: 1 }),
    }).create()

    await FolioFactory.merge({
      userId,
      name: 'Second Collection',
      isRoot: false,
      createdAt: DateTime.now(),
    }).create()

    const response = await client
      .get('/api/v1/folios')
      .header('Authorization', 'Bearer fake-token-for-testing')

    response.assertStatus(200)

    const folios = response.body()
    assert.isArray(folios)
    assert.lengthOf(folios, 2)

    assert.equal(folios[0].name, 'Second Collection')
    assert.equal(folios[1].name, 'First Collection')
  })

  test('index - should require authentication', async ({ client }) => {
    const response = await client.get('/api/v1/folios')

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

    await UserFactory.merge({
      id: otherUserId,
      username: 'other-test-user',
    }).create()

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

  test('cards - should return paginated cards from specific child folio', async ({
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

  test('cards - should return 403 when folio is not owned by user', async ({ client }) => {
    const otherUserId = 'other-user-id'

    await UserFactory.merge({
      id: otherUserId,
      username: 'other-test-user',
    }).create()

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

  test('cards - should return 422 when trying to access main folio cards', async ({ client }) => {
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

  test('store - it should create a folio with cards from main folio', async ({
    client,
    assert,
  }) => {
    const userId = TEST_AUTH_USER_ID

    const rootFolio = await FolioFactory.merge({
      userId,
      name: 'root',
      isRoot: true,
    }).create()

    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.merge({ id: 'base1' }).create()

    const card1 = await CardFactory.merge({ id: 'base1-1' }).create()
    const card2 = await CardFactory.merge({ id: 'base1-2' }).create()

    await CardFolioFactory.merge({
      cardId: card1.id,
      folioId: rootFolio.id,
      occurrence: 5,
    }).create()

    await CardFolioFactory.merge({
      cardId: card2.id,
      folioId: rootFolio.id,
      occurrence: 3,
    }).create()

    const response = await client
      .post('/api/v1/folios')
      .header('Authorization', 'Bearer fake-token-for-testing')
      .json({
        name: 'My Custom Folio',
        imageUrl: 'https://example.com/folio.jpg',
        cards: [
          { id: 'base1-1', occurrence: 2 },
          { id: 'base1-2', occurrence: 1 },
        ],
      })

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Folio created successfully',
    })

    const createdFolio = await Folio.query()
      .where('user_id', userId)
      .where('name', 'My Custom Folio')
      .where('is_root', false)
      .first()

    assert.exists(createdFolio)
    assert.equal(createdFolio?.name, 'My Custom Folio')
    assert.equal(createdFolio?.image, 'https://example.com/folio.jpg')

    const folioCards = await CardFolio.query()
      .where('folio_id', createdFolio!.id)
      .orderBy('card_id')

    assert.lengthOf(folioCards, 2)
    assert.equal(folioCards[0].cardId, card1.id)
    assert.equal(folioCards[0].occurrence, 2)
    assert.equal(folioCards[1].cardId, card2.id)
    assert.equal(folioCards[1].occurrence, 1)
  })

  test('store - it should return 403 when card is not owned in main folio', async ({ client }) => {
    const userId = TEST_AUTH_USER_ID

    await FolioFactory.merge({
      userId,
      name: 'root',
      isRoot: true,
    }).create()

    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.merge({ id: 'base1' }).create()

    const card = await CardFactory.create()

    const response = await client
      .post('/api/v1/folios')
      .header('Authorization', 'Bearer fake-token-for-testing')
      .json({
        name: 'My Custom Folio',
        imageUrl: 'https://example.com/folio.jpg',
        cards: [{ id: card.id, occurrence: 1 }],
      })

    response.assertStatus(403)
    response.assertBodyContains({
      code: 'E_CARD_NOT_OWNED',
    })
  })

  test('store - it should return 422 when insufficient card occurrence', async ({ client }) => {
    const userId = TEST_AUTH_USER_ID

    const rootFolio = await FolioFactory.merge({
      userId,
      name: 'root',
      isRoot: true,
    }).create()

    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.merge({ id: 'base1' }).create()

    const card = await CardFactory.create()

    // Add only 2 cards to main folio
    await CardFolioFactory.merge({ cardId: card.id, folioId: rootFolio.id, occurrence: 2 }).create()

    const response = await client
      .post('/api/v1/folios')
      .header('Authorization', 'Bearer fake-token-for-testing')
      .json({
        name: 'My Custom Folio',
        imageUrl: 'https://example.com/folio.jpg',
        cards: [
          { id: card.id, occurrence: 5 }, // Requesting more than available
        ],
      })

    response.assertStatus(422)
    response.assertBodyContains({
      code: 'E_INSUFFICIENT_CARD_OCCURRENCE',
    })
  })

  test('store - it should return 404 for non-existent card', async ({ client }) => {
    const userId = TEST_AUTH_USER_ID

    await FolioFactory.merge({
      userId,
      name: 'root',
      isRoot: true,
    }).create()

    const response = await client
      .post('/api/v1/folios')
      .header('Authorization', 'Bearer fake-token-for-testing')
      .json({
        name: 'My Custom Folio',
        imageUrl: 'https://example.com/folio.jpg',
        cards: [{ id: 'non-existent-card-id', occurrence: 1 }],
      })

    response.assertStatus(404)
    response.assertBodyContains({
      code: 'E_ROW_NOT_FOUND',
    })
  })

  test('store - it should validate the request payload', async ({ client }) => {
    const response = await client
      .post('/api/v1/folios')
      .header('Authorization', 'Bearer fake-token-for-testing')
      .json({
        name: '', // Invalid: too short
        cards: [
          { id: 'card-id', occurrence: 0 }, // Invalid: occurrence too low
        ],
      })

    response.assertStatus(422)
  })

  test('store - it should require authentication', async ({ client }) => {
    const response = await client.post('/api/v1/folios').json({
      name: 'My Custom Folio',
      imageUrl: 'https://example.com/folio.jpg',
      cards: [],
    })

    response.assertStatus(401)
  })

  test('store - it should handle empty cards array', async ({ client }) => {
    const userId = TEST_AUTH_USER_ID

    await FolioFactory.merge({
      userId,
      name: 'root',
      isRoot: true,
    }).create()

    const response = await client
      .post('/api/v1/folios')
      .header('Authorization', 'Bearer fake-token-for-testing')
      .json({
        name: 'Empty Folio',
        imageUrl: 'https://example.com/folio.jpg',
        cards: [],
      })

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Folio created successfully',
    })
  })
})
