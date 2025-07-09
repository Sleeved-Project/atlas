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
import { SubtypeFactory } from '#database/factories/subtype'
import { TypeFactory } from '#database/factories/type'
import { DateTime } from 'luxon'
import CardFolio from '#models/card_folio'

test.group('Main folio controller', (group) => {
  let wardenApiClientStub: sinon.SinonStub

  group.setup(() => {
    wardenApiClientStub = AuthServiceMock.setupWardenApiClientStub()
  })

  group.each.setup(() => testUtils.db().withGlobalTransaction())

  group.teardown(() => {
    wardenApiClientStub.restore()
  })

  test('mainFolioCards - should return paginated cards from user main folio', async ({
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

    const cards = await CardFactory.createMany(3)

    await CardFolioFactory.merge({
      cardId: cards[0].id,
      folioId: mainFolio.id,
      occurrence: 2,
    }).create()

    await CardFolioFactory.merge({
      cardId: cards[1].id,
      folioId: mainFolio.id,
      occurrence: 1,
    }).create()

    await CardFolioFactory.merge({
      cardId: cards[2].id,
      folioId: mainFolio.id,
      occurrence: 3,
    }).create()

    const response = await client
      .get('/api/v1/folios/cards')
      .header('Authorization', 'Bearer fake-token-for-testing')
      .qs({ page: 1, limit: 10 })

    response.assertStatus(200)

    const body = response.body()
    assert.properties(body, ['meta', 'data'])
    assert.properties(body.meta, ['total', 'currentPage', 'perPage'])
    assert.equal(body.meta.total, 3)
    assert.equal(body.meta.currentPage, 1)

    assert.isArray(body.data)
    assert.equal(body.data.length, 3)

    const firstCardFolio = body.data[0]
    assert.properties(firstCardFolio, ['id', 'occurrence', 'card'])
    assert.isString(firstCardFolio.id)
    assert.isNumber(firstCardFolio.occurrence)

    assert.properties(firstCardFolio.card, ['id', 'imageSmall'])
    assert.isString(firstCardFolio.card.id)
    assert.isString(firstCardFolio.card.imageSmall)

    const cardIds = body.data.map((cardFolio: any) => cardFolio.card.id)
    assert.includeMembers(cardIds, [cards[0].id, cards[1].id, cards[2].id])

    const cardFolioWithOccurrence2 = body.data.find((cf: any) => cf.card.id === cards[0].id)
    const cardFolioWithOccurrence1 = body.data.find((cf: any) => cf.card.id === cards[1].id)
    const cardFolioWithOccurrence3 = body.data.find((cf: any) => cf.card.id === cards[2].id)

    assert.equal(cardFolioWithOccurrence2.occurrence, 2)
    assert.equal(cardFolioWithOccurrence1.occurrence, 1)
    assert.equal(cardFolioWithOccurrence3.occurrence, 3)
  })

  test('mainFolioCards - should return empty result when user has no cards in main folio', async ({
    client,
    assert,
  }) => {
    const userId = TEST_AUTH_USER_ID

    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.merge({ id: 'base1' }).create()

    await CardFactory.createMany(3)

    await FolioFactory.merge({
      userId,
      isRoot: true,
    }).create()

    const response = await client
      .get('/api/v1/folios/cards')
      .header('Authorization', 'Bearer fake-token-for-testing')
      .qs({ page: 1, limit: 10 })

    response.assertStatus(200)

    const body = response.body()
    assert.equal(body.meta.total, 0)
    assert.equal(body.meta.currentPage, 1)
    assert.isArray(body.data)
    assert.equal(body.data.length, 0)
  })

  test('mainFolioCards - should handle pagination correctly', async ({ client, assert }) => {
    const userId = TEST_AUTH_USER_ID

    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.merge({ id: 'base1' }).create()

    const mainFolio = await FolioFactory.merge({
      userId,
      isRoot: true,
    }).create()

    await CardFactory.with('cardFolios', 1, (cardFolios) =>
      cardFolios.merge([
        {
          folioId: mainFolio.id,
          occurrence: 1,
        },
      ])
    ).createMany(15)

    const page1Response = await client
      .get('/api/v1/folios/cards')
      .header('Authorization', 'Bearer fake-token-for-testing')
      .qs({ page: 1, limit: 10 })

    page1Response.assertStatus(200)
    const page1Body = page1Response.body()
    assert.equal(page1Body.data.length, 10)
    assert.equal(page1Body.meta.currentPage, 1)

    const firstCardFolio = page1Body.data[0]
    assert.properties(firstCardFolio, ['id', 'occurrence', 'card'])
    assert.properties(firstCardFolio.card, ['id', 'imageSmall'])

    const page2Response = await client
      .get('/api/v1/folios/cards')
      .header('Authorization', 'Bearer fake-token-for-testing')
      .qs({ page: 2, limit: 10 })

    page2Response.assertStatus(200)
    const page2Body = page2Response.body()
    assert.equal(page2Body.data.length, 5)
    assert.equal(page2Body.meta.currentPage, 2)
  })

  test('mainFolioCards - should only return cards from main folio, not secondary folios', async ({
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

    const secondaryFolio = await FolioFactory.merge({
      userId,
      isRoot: false,
    }).create()

    const cards = await CardFactory.createMany(3)

    await CardFolioFactory.merge({
      cardId: cards[0].id,
      folioId: mainFolio.id,
      occurrence: 1,
    }).create()

    // Add cards to secondary folio (should not be returned in main folio cards)
    await CardFolioFactory.merge({
      cardId: cards[1].id,
      folioId: secondaryFolio.id,
      occurrence: 2,
    }).create()

    await CardFolioFactory.merge({
      cardId: cards[2].id,
      folioId: secondaryFolio.id,
      occurrence: 1,
    }).create()

    const response = await client
      .get('/api/v1/folios/cards')
      .header('Authorization', 'Bearer fake-token-for-testing')
      .qs({ page: 1, limit: 10 })

    response.assertStatus(200)

    const body = response.body()
    assert.equal(body.meta.total, 1)
    assert.equal(body.data.length, 1)

    const returnedCardFolio = body.data[0]
    assert.properties(returnedCardFolio, ['id', 'occurrence', 'card'])
    assert.equal(returnedCardFolio.card.id, cards[0].id)
    assert.equal(returnedCardFolio.occurrence, 1)
  })

  test('mainFolioCards - should validate query parameters', async ({ client }) => {
    const response = await client
      .get('/api/v1/folios/cards')
      .header('Authorization', 'Bearer fake-token-for-testing')
      .qs({ page: 'invalid', limit: 'invalid' })

    response.assertStatus(422)
    response.assertBodyContains({
      code: 'E_VALIDATION_ERROR',
    })
  })

  test('mainFolioCards - should return 404 when user has no main folio', async ({ client }) => {
    const response = await client
      .get('/api/v1/folios/cards')
      .header('Authorization', 'Bearer fake-token-for-testing')
      .qs({ page: 1, limit: 10 })

    response.assertStatus(404)
    response.assertBodyContains({
      code: 'E_ROW_NOT_FOUND',
    })
  })

  test('mainFolioCards - should require authentication', async ({ client }) => {
    const response = await client.get('/api/v1/folios/cards').qs({ page: 1, limit: 10 })

    response.assertStatus(401)
  })

  test('mainFolioCards - should filter cards by name when name parameter is provided', async ({
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

    const pikachuCard = await CardFactory.merge({
      name: 'Pikachu',
    }).create()

    const charizardCard = await CardFactory.merge({
      name: 'Charizard',
    }).create()

    const bulbasaurCard = await CardFactory.merge({
      name: 'Bulbasaur',
    }).create()

    await CardFolioFactory.merge([
      { cardId: pikachuCard.id, folioId: mainFolio.id, occurrence: 1 },
      { cardId: charizardCard.id, folioId: mainFolio.id, occurrence: 2 },
      { cardId: bulbasaurCard.id, folioId: mainFolio.id, occurrence: 1 },
    ]).createMany(3)

    const response = await client
      .get('/api/v1/folios/cards')
      .header('Authorization', 'Bearer fake-token-for-testing')
      .qs({ page: 1, limit: 10, name: 'Pika' })

    response.assertStatus(200)

    const body = response.body()
    assert.equal(body.meta.total, 1)
    assert.equal(body.data.length, 1)

    const returnedCardFolio = body.data[0]
    assert.equal(returnedCardFolio.card.id, pikachuCard.id)
    assert.equal(returnedCardFolio.occurrence, 1)
  })

  test('mainFolioCards - should filter cards by rarities when rarities parameter is provided', async ({
    client,
    assert,
  }) => {
    const userId = TEST_AUTH_USER_ID

    await LegalityFactory.create()
    await SetFactory.merge({ id: 'base1' }).create()

    const commonRarity = await RarityFactory.merge({ id: 1, label: 'Common' }).create()
    const rareRarity = await RarityFactory.merge({ id: 2, label: 'Rare' }).create()
    const artist = await ArtistFactory.create()

    const mainFolio = await FolioFactory.merge({
      userId,
      isRoot: true,
    }).create()

    const commonCard = await CardFactory.merge({
      name: 'Common Card',
      rarityId: commonRarity.id,
      artistId: artist.id,
    }).create()

    const rareCard = await CardFactory.merge({
      name: 'Rare Card',
      rarityId: rareRarity.id,
      artistId: artist.id,
    }).create()

    await CardFolioFactory.merge([
      { cardId: commonCard.id, folioId: mainFolio.id, occurrence: 1 },
      { cardId: rareCard.id, folioId: mainFolio.id, occurrence: 2 },
    ]).createMany(2)

    const response = await client
      .get(`/api/v1/folios/cards?rarities[]=${commonRarity.id}`)
      .header('Authorization', 'Bearer fake-token-for-testing')
      .qs({ page: 1, limit: 10 })

    response.assertStatus(200)

    const body = response.body()
    assert.equal(body.meta.total, 1)
    assert.equal(body.data.length, 1)

    const returnedCardFolio = body.data[0]
    assert.equal(returnedCardFolio.card.id, commonCard.id)
    assert.equal(returnedCardFolio.occurrence, 1)
  })

  test('mainFolioCards - should filter cards by artists when artists parameter is provided', async ({
    client,
    assert,
  }) => {
    const userId = TEST_AUTH_USER_ID

    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.merge({ id: 'base1' }).create()

    const artist1 = await ArtistFactory.merge({ id: 1, name: 'Artist One' }).create()
    const artist2 = await ArtistFactory.merge({ id: 2, name: 'Artist Two' }).create()

    const mainFolio = await FolioFactory.merge({
      userId,
      isRoot: true,
    }).create()

    const card1 = await CardFactory.merge({
      name: 'Card by Artist One',
      artistId: artist1.id,
    }).create()

    const card2 = await CardFactory.merge({
      name: 'Card by Artist Two',
      artistId: artist2.id,
    }).create()

    await CardFolioFactory.merge([
      { cardId: card1.id, folioId: mainFolio.id, occurrence: 1 },
      { cardId: card2.id, folioId: mainFolio.id, occurrence: 2 },
    ]).createMany(2)

    const response = await client
      .get(`/api/v1/folios/cards?artists[]=${artist1.id}`)
      .header('Authorization', 'Bearer fake-token-for-testing')
      .qs({ page: 1, limit: 10 })

    response.assertStatus(200)

    const body = response.body()
    assert.equal(body.meta.total, 1)
    assert.equal(body.data.length, 1)

    const returnedCardFolio = body.data[0]
    assert.equal(returnedCardFolio.card.id, card1.id)
    assert.equal(returnedCardFolio.occurrence, 1)
  })

  test('mainFolioCards - should filter cards by subtypes when subtypes parameter is provided', async ({
    client,
    assert,
  }) => {
    const userId = TEST_AUTH_USER_ID

    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.merge({ id: 'base1' }).create()

    const basicSubtype = await SubtypeFactory.merge({ id: 1, label: 'Basic' }).create()
    const stage1Subtype = await SubtypeFactory.merge({ id: 2, label: 'Stage 1' }).create()

    const mainFolio = await FolioFactory.merge({
      userId,
      isRoot: true,
    }).create()

    const basicCard = await CardFactory.merge({
      name: 'Basic Card',
    })
      .with('subtypes', 1, (subtypes) => subtypes.merge([basicSubtype]))
      .create()

    const stage1Card = await CardFactory.merge({
      name: 'Stage 1 Card',
    })
      .with('subtypes', 1, (subtypes) => subtypes.merge([stage1Subtype]))
      .create()

    await CardFolioFactory.merge([
      { cardId: basicCard.id, folioId: mainFolio.id, occurrence: 1 },
      { cardId: stage1Card.id, folioId: mainFolio.id, occurrence: 2 },
    ]).createMany(2)

    const response = await client
      .get(`/api/v1/folios/cards?subtypes[]=${basicSubtype.id}`)
      .header('Authorization', 'Bearer fake-token-for-testing')
      .qs({ page: 1, limit: 10 })

    response.assertStatus(200)

    const body = response.body()
    assert.equal(body.meta.total, 1)
    assert.equal(body.data.length, 1)

    const returnedCardFolio = body.data[0]
    assert.equal(returnedCardFolio.card.id, basicCard.id)
    assert.equal(returnedCardFolio.occurrence, 1)
  })

  test('mainFolioCards - should filter cards by types when types parameter is provided', async ({
    client,
    assert,
  }) => {
    const userId = TEST_AUTH_USER_ID

    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.merge({ id: 'base1' }).create()

    const psychicType = await TypeFactory.merge({ id: 1, label: 'Psychic' }).create()
    const fireType = await TypeFactory.merge({ id: 2, label: 'Fire' }).create()

    const mainFolio = await FolioFactory.merge({
      userId,
      isRoot: true,
    }).create()

    const psychicCard = await CardFactory.merge({
      name: 'Psychic Card',
    })
      .with('types', 1, (types) => types.merge([psychicType]))
      .create()

    const fireCard = await CardFactory.merge({
      name: 'Fire Card',
    })
      .with('types', 1, (types) => types.merge([fireType]))
      .create()

    await CardFolioFactory.merge([
      { cardId: psychicCard.id, folioId: mainFolio.id, occurrence: 1 },
      { cardId: fireCard.id, folioId: mainFolio.id, occurrence: 2 },
    ]).createMany(2)

    const response = await client
      .get(`/api/v1/folios/cards?types[]=${psychicType.id}`)
      .header('Authorization', 'Bearer fake-token-for-testing')
      .qs({ page: 1, limit: 10 })

    response.assertStatus(200)

    const body = response.body()
    assert.equal(body.meta.total, 1)
    assert.equal(body.data.length, 1)

    const returnedCardFolio = body.data[0]
    assert.equal(returnedCardFolio.card.id, psychicCard.id)
    assert.equal(returnedCardFolio.occurrence, 1)
  })

  test('mainFolioCards - should apply multiple filters simultaneously', async ({
    client,
    assert,
  }) => {
    const userId = TEST_AUTH_USER_ID

    await LegalityFactory.create()
    await SetFactory.merge({ id: 'base1' }).create()

    const commonRarity = await RarityFactory.merge({ id: 1, label: 'Common' }).create()
    const rareRarity = await RarityFactory.merge({ id: 2, label: 'Rare' }).create()
    const artist1 = await ArtistFactory.merge({ id: 1, name: 'Artist One' }).create()

    const mainFolio = await FolioFactory.merge({
      userId,
      isRoot: true,
    }).create()

    const matchingCard = await CardFactory.merge({
      name: 'Pikachu Common',
      rarityId: commonRarity.id,
      artistId: artist1.id,
    }).create()

    const nonMatchingCard1 = await CardFactory.merge({
      name: 'Charizard Common',
      rarityId: commonRarity.id,
      artistId: artist1.id,
    }).create()

    const nonMatchingCard2 = await CardFactory.merge({
      name: 'Pikachu Rare',
      rarityId: rareRarity.id,
      artistId: artist1.id,
    }).create()

    await CardFolioFactory.merge([
      { cardId: matchingCard.id, folioId: mainFolio.id, occurrence: 1 },
      { cardId: nonMatchingCard1.id, folioId: mainFolio.id, occurrence: 2 },
      { cardId: nonMatchingCard2.id, folioId: mainFolio.id, occurrence: 3 },
    ]).createMany(3)

    const response = await client
      .get(`/api/v1/folios/cards?rarities[]=${commonRarity.id}`)
      .header('Authorization', 'Bearer fake-token-for-testing')
      .qs({
        page: 1,
        limit: 10,
        name: 'Pika',
      })

    response.assertStatus(200)

    const body = response.body()
    assert.equal(body.meta.total, 1)
    assert.equal(body.data.length, 1)

    const returnedCardFolio = body.data[0]
    assert.equal(returnedCardFolio.card.id, matchingCard.id)
    assert.equal(returnedCardFolio.occurrence, 1)
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

  test('collect - it should add a card to user main folio', async ({ client, assert }) => {
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

    const response = await client
      .post('/api/v1/folios/cards')
      .header('Authorization', 'Bearer fake-token-for-testing')
      .json({ cardId: card.id })

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Card added to your main folio successfully',
    })

    const cardFolio = await CardFolio.query()
      .where('folio_id', rootFolio.id)
      .where('card_id', card.id)
      .first()

    assert.exists(cardFolio)
    assert.equal(cardFolio?.folioId, rootFolio.id)
    assert.equal(cardFolio?.cardId, card.id)
    assert.equal(cardFolio?.occurrence, 1)
  })

  test('collect - it should return conflict same card again', async ({ client, assert }) => {
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

    await CardFolioFactory.merge({ cardId: card.id, folioId: rootFolio.id, occurrence: 1 }).create()

    const response = await client
      .post('/api/v1/folios/cards')
      .header('Authorization', 'Bearer fake-token-for-testing')
      .json({ cardId: card.id })

    response.assertStatus(409)

    const cardFolio = await CardFolio.query()
      .where('folio_id', rootFolio.id)
      .where('card_id', card.id)
      .first()

    assert.exists(cardFolio)
    assert.equal(cardFolio?.occurrence, 1)
  })

  test('collect - it should return 404 for non-existent card', async ({ client }) => {
    const userId = TEST_AUTH_USER_ID

    await FolioFactory.merge({
      userId,
      name: 'root',
      isRoot: true,
    }).create()

    const response = await client
      .post('/api/v1/folios/cards')
      .header('Authorization', 'Bearer fake-token-for-testing')
      .json({ cardId: 'non-existent-card-id' })

    response.assertStatus(404)
    response.assertBodyContains({
      message: 'Card not found',
      code: 'E_ROW_NOT_FOUND',
    })
  })

  test('collect - it should validate the request payload', async ({ client }) => {
    const response = await client
      .post('/api/v1/folios/cards')
      .header('Authorization', 'Bearer fake-token-for-testing')
      .json({})

    response.assertStatus(422)
  })

  test('collect - it should require authentication', async ({ client }) => {
    const response = await client.post('/api/v1/folios/cards').json({ cardId: 'base1-1' })
    response.assertStatus(401)
  })

  test('updateOccurrence - it should update card occurrence in user main folio', async ({
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
    const card = await CardFactory.create()

    await CardFolioFactory.merge({
      cardId: card.id,
      folioId: rootFolio.id,
      occurrence: 2,
    }).create()

    const response = await client
      .patch(`/api/v1/folios/cards/${card.id}`)
      .header('Authorization', 'Bearer fake-token-for-testing')
      .json({ occurrence: 5 })

    response.assertStatus(200)
    response.assertBodyContains({
      message: 'Card occurrence updated successfully',
    })

    const updatedCardFolio = await CardFolio.query()
      .where('folio_id', rootFolio.id)
      .where('card_id', card.id)
      .first()

    assert.exists(updatedCardFolio)
    assert.equal(updatedCardFolio?.occurrence, 5)
  })

  test('updateOccurrence - it should return 404 when card folio does not exist', async ({
    client,
  }) => {
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
      .patch(`/api/v1/folios/cards/${card.id}`)
      .header('Authorization', 'Bearer fake-token-for-testing')
      .json({ occurrence: 3 })

    response.assertStatus(404)
    response.assertBodyContains({
      code: 'E_ROW_NOT_FOUND',
    })
  })

  test('updateOccurrence - it should validate the request payload', async ({ client }) => {
    const response = await client
      .patch(`/api/v1/folios/cards/base1-1`)
      .header('Authorization', 'Bearer fake-token-for-testing')
      .json({})

    response.assertStatus(422)
  })

  test('updateOccurrence - it should require authentication', async ({ client }) => {
    const response = await client.patch(`/api/v1/folios/cards/base1-1`).json({ occurrence: 3 })

    response.assertStatus(401)
  })

  test('updateOccurrence - it should return 404 for non-existent card', async ({ client }) => {
    const userId = TEST_AUTH_USER_ID

    await FolioFactory.merge({
      userId,
      name: 'root',
      isRoot: true,
    }).create()

    const response = await client
      .patch(`/api/v1/folios/cards/no-existent`)
      .header('Authorization', 'Bearer fake-token-for-testing')
      .json({ occurrence: 3 })

    response.assertStatus(404)
    response.assertBodyContains({
      message: 'Card not found',
      code: 'E_ROW_NOT_FOUND',
    })
  })
})
