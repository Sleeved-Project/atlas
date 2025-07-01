import { test } from '@japa/runner'
import CardFolioService from '#services/card_folio_service'
import testUtils from '@adonisjs/core/services/test_utils'
import CardFolio from '#models/card_folio'
import { CardFactory } from '#database/factories/card'
import { FolioFactory } from '#database/factories/folio'
import { v4 as uuidv4 } from 'uuid'
import { ArtistFactory } from '#database/factories/artist'
import { RarityFactory } from '#database/factories/rarity'
import { LegalityFactory } from '#database/factories/legality'
import { SetFactory } from '#database/factories/set'
import { TEST_AUTH_USER_ID } from '#tests/mocks/auth_service_mock'
import { CardFolioFactory } from '#database/factories/card_folio'
import Card from '#models/card'
import CardMarketPrice from '#models/card_market_price'
import TcgPlayerReporting from '#models/tcg_player_reporting'
import TcgPlayerPrice from '#models/tcg_player_price'
import { DateTime } from 'luxon'

test.group('CardFolioService', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  let cardFolioService: CardFolioService

  group.setup(() => {
    cardFolioService = new CardFolioService()
  })

  test('createCardFolio - should create a card folio relationship with occurrence 1', async ({
    assert,
  }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()
    const card = await CardFactory.create()
    const folio = await FolioFactory.create()

    const cardFolio = await cardFolioService.createCardFolio(card.id, folio.id)

    assert.exists(cardFolio)
    assert.isNotNull(cardFolio.id)
    assert.equal(cardFolio.cardId, card.id)
    assert.equal(cardFolio.folioId, folio.id)
    assert.equal(cardFolio.occurrence, 1)

    const savedCardFolio = await CardFolio.query()
      .where('card_id', card.id)
      .where('folio_id', folio.id)
      .first()

    assert.exists(savedCardFolio)
    assert.equal(savedCardFolio?.id, cardFolio.id)
  })

  test('createCardFolio - should throw error when card does not exist', async ({ assert }) => {
    const nonExistentCardId = 'non-existent-card'
    const folio = await FolioFactory.create()

    await assert.rejects(
      async () => await cardFolioService.createCardFolio(nonExistentCardId, folio.id)
    )
  })

  test('createCardFolio - should throw error when folio does not exist', async ({ assert }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()
    const card = await CardFactory.create()
    const nonExistentFolioId = uuidv4()

    await assert.rejects(
      async () => await cardFolioService.createCardFolio(card.id, nonExistentFolioId)
    )
  })

  test('createCardFolio - should throw unique constraint error for duplicate entry', async ({
    assert,
  }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()
    const card = await CardFactory.create()
    const folio = await FolioFactory.create()

    await cardFolioService.createCardFolio(card.id, folio.id)

    await assert.rejects(async () => await cardFolioService.createCardFolio(card.id, folio.id))
  })

  test('getAllMainFolioCards - should return paginated cards from user main folio', async ({
    assert,
  }) => {
    const userId = TEST_AUTH_USER_ID

    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()

    const mainFolio = await FolioFactory.merge({
      userId,
      isRoot: true,
    }).create()

    const secondaryFolio = await FolioFactory.merge({
      userId,
      isRoot: false,
    }).create()

    const cards = await CardFactory.createMany(5)

    const cardFolio1 = await CardFolioFactory.merge({
      cardId: cards[0].id,
      folioId: mainFolio.id,
      occurrence: 2,
    }).create()

    const cardFolio2 = await CardFolioFactory.merge({
      cardId: cards[1].id,
      folioId: mainFolio.id,
      occurrence: 1,
    }).create()

    await CardFolioFactory.merge({
      cardId: cards[2].id,
      folioId: secondaryFolio.id,
      occurrence: 3,
    }).create()

    const result = await cardFolioService.getAllMainFolioCards({ page: 1, limit: 10 }, mainFolio.id)

    assert.equal(result.length, 2)
    assert.equal(result.currentPage, 1)

    const cardFolioIds = result.map((cardFolio) => cardFolio.id)
    assert.includeMembers(cardFolioIds, [cardFolio1.id, cardFolio2.id])

    const firstCardFolio = result[0].$attributes
    assert.properties(firstCardFolio, ['id', 'occurrence', 'cardId', 'folioId'])
    assert.equal(firstCardFolio.folioId, mainFolio.id)

    assert.property(result[0].$preloaded, 'card')
    const preloadedCard = result[0].$preloaded.card as Card
    assert.properties(preloadedCard.$attributes, ['id', 'imageSmall'])
    assert.isString(preloadedCard.$attributes.id)
    assert.isString(preloadedCard.$attributes.imageSmall)
  })

  test('getAllMainFolioCards - should only return cards for specified folio', async ({
    assert,
  }) => {
    const userId1 = TEST_AUTH_USER_ID
    const userId2 = 'other-user-id'

    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()

    const mainFolio1 = await FolioFactory.merge({
      userId: userId1,
      isRoot: true,
    }).create()

    const mainFolio2 = await FolioFactory.merge({
      userId: userId2,
      isRoot: true,
    }).create()

    const cards = await CardFactory.createMany(4)

    const cardFolio1 = await CardFolioFactory.merge({
      cardId: cards[0].id,
      folioId: mainFolio1.id,
      occurrence: 1,
    }).create()

    const cardFolio2 = await CardFolioFactory.merge({
      cardId: cards[1].id,
      folioId: mainFolio1.id,
      occurrence: 2,
    }).create()

    const cardFolio3 = await CardFolioFactory.merge({
      cardId: cards[2].id,
      folioId: mainFolio2.id,
      occurrence: 1,
    }).create()

    const cardFolio4 = await CardFolioFactory.merge({
      cardId: cards[3].id,
      folioId: mainFolio2.id,
      occurrence: 3,
    }).create()

    const resultFolio1 = await cardFolioService.getAllMainFolioCards(
      { page: 1, limit: 10 },
      mainFolio1.id
    )

    assert.equal(resultFolio1.length, 2)
    const cardFolioIdsFolio1 = resultFolio1.map((cardFolio) => cardFolio.id)
    assert.includeMembers(cardFolioIdsFolio1, [cardFolio1.id, cardFolio2.id])
    assert.notIncludeMembers(cardFolioIdsFolio1, [cardFolio3.id, cardFolio4.id])

    const resultFolio2 = await cardFolioService.getAllMainFolioCards(
      { page: 1, limit: 10 },
      mainFolio2.id
    )

    assert.equal(resultFolio2.length, 2)
    const cardFolioIdsFolio2 = resultFolio2.map((cardFolio) => cardFolio.id)
    assert.includeMembers(cardFolioIdsFolio2, [cardFolio3.id, cardFolio4.id])
    assert.notIncludeMembers(cardFolioIdsFolio2, [cardFolio1.id, cardFolio2.id])
  })

  test('getAllMainFolioCards - should sort by set release date and card number', async ({
    assert,
  }) => {
    const userId = TEST_AUTH_USER_ID

    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()

    const mainFolio = await FolioFactory.merge({
      userId,
      isRoot: true,
    }).create()

    await CardFactory.merge([
      { id: 'base1-3', number: '3' },
      { id: 'base1-1', number: '1' },
      { id: 'base1-2', number: '2' },
    ])
      .with('cardFolios', 1, (cardFolios) =>
        cardFolios.merge([
          {
            folioId: mainFolio.id,
            occurrence: 1,
          },
        ])
      )
      .createMany(3)

    const result = await cardFolioService.getAllMainFolioCards({ page: 1, limit: 10 }, mainFolio.id)

    const cardIds = result.map((cardFolio) => cardFolio.cardId)
    assert.equal(cardIds[0], 'base1-1')
    assert.equal(cardIds[1], 'base1-2')
    assert.equal(cardIds[2], 'base1-3')
  })

  test('getAllMainFolioCards - should handle pagination correctly', async ({ assert }) => {
    const userId = TEST_AUTH_USER_ID

    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()

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

    const page1 = await cardFolioService.getAllMainFolioCards({ page: 1, limit: 10 }, mainFolio.id)

    assert.equal(page1.length, 10)
    assert.equal(page1.currentPage, 1)

    const page2 = await cardFolioService.getAllMainFolioCards({ page: 2, limit: 10 }, mainFolio.id)

    assert.equal(page2.length, 5)
    assert.equal(page2.currentPage, 2)
  })

  test('getAllMainFolioCards - should return empty result for non-existent folio', async ({
    assert,
  }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()

    const result = await cardFolioService.getAllMainFolioCards(
      { page: 1, limit: 10 },
      'non-existent-folio-id'
    )

    assert.equal(result.length, 0)
  })

  test('getAllMainFolioCardPricesAndOccurrenceByDaysBefore - should return cards with prices and occurrence for specified folio', async ({
    assert,
  }) => {
    const userId = TEST_AUTH_USER_ID

    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()

    const mainFolio = await FolioFactory.merge({
      userId,
      isRoot: true,
    }).create()

    const cards = await CardFactory.with('cardMarketPrices', 1, (cardMarketPrices) =>
      cardMarketPrices.merge({
        trendPrice: 10.5,
        reverseHoloTrend: 15.75,
      })
    )
      .with('tcgPlayerReportings', 1, (tcgPlayerReportings) =>
        tcgPlayerReportings.with('tcgPlayerPrices', 2, (tcgPlayerPrices) =>
          tcgPlayerPrices.merge([
            { type: 'normal', market: 12.0 },
            { type: 'holofoil', market: 18.5 },
          ])
        )
      )
      .createMany(3)

    await CardFolioFactory.merge([
      { cardId: cards[0].id, folioId: mainFolio.id, occurrence: 2 },
      { cardId: cards[1].id, folioId: mainFolio.id, occurrence: 1 },
      { cardId: cards[2].id, folioId: mainFolio.id, occurrence: 3 },
    ]).createMany(3)

    const result = await cardFolioService.getAllMainFolioCardPricesAndOccurrenceByDaysBefore(
      mainFolio.id,
      7
    )

    assert.equal(result.length, 3)

    const firstCardFolio = result[0].$attributes
    assert.properties(firstCardFolio, ['id', 'occurrence', 'cardId', 'folioId'])
    assert.equal(firstCardFolio.folioId, mainFolio.id)

    assert.property(result[0].$preloaded, 'card')
    const preloadedCard = result[0].$preloaded.card as Card
    assert.properties(preloadedCard.$attributes, ['id', 'imageSmall'])

    assert.property(preloadedCard.$preloaded, 'cardMarketPrices')
    const cardMarketPrices = preloadedCard.$preloaded.cardMarketPrices as CardMarketPrice[]
    assert.isArray(cardMarketPrices)
    assert.properties(cardMarketPrices[0].$attributes, ['id', 'trendPrice', 'reverseHoloTrend'])

    assert.property(preloadedCard.$preloaded, 'tcgPlayerReportings')
    const tcgPlayerReportings = preloadedCard.$preloaded.tcgPlayerReportings as TcgPlayerReporting[]
    assert.isArray(tcgPlayerReportings)
    assert.properties(tcgPlayerReportings[0].$attributes, ['id', 'url'])

    const tcgPlayerPrices = tcgPlayerReportings[0].$preloaded.tcgPlayerPrices as TcgPlayerPrice[]
    assert.isArray(tcgPlayerPrices)
    assert.properties(tcgPlayerPrices[0].$attributes, ['id', 'type', 'market'])
  })

  test('getAllMainFolioCardPricesAndOccurrenceByDaysBefore - should only return cards for specified folio', async ({
    assert,
  }) => {
    const userId1 = TEST_AUTH_USER_ID
    const userId2 = 'other-user-id'

    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()

    const mainFolio1 = await FolioFactory.merge({
      userId: userId1,
      isRoot: true,
    }).create()

    const mainFolio2 = await FolioFactory.merge({
      userId: userId2,
      isRoot: true,
    }).create()

    const cards = await CardFactory.with('cardMarketPrices')
      .with('tcgPlayerReportings')
      .createMany(4)

    const cardFolio1 = await CardFolioFactory.merge({
      cardId: cards[0].id,
      folioId: mainFolio1.id,
      occurrence: 1,
    }).create()

    const cardFolio2 = await CardFolioFactory.merge({
      cardId: cards[1].id,
      folioId: mainFolio1.id,
      occurrence: 2,
    }).create()

    const cardFolio3 = await CardFolioFactory.merge({
      cardId: cards[2].id,
      folioId: mainFolio2.id,
      occurrence: 1,
    }).create()

    const cardFolio4 = await CardFolioFactory.merge({
      cardId: cards[3].id,
      folioId: mainFolio2.id,
      occurrence: 3,
    }).create()

    const resultFolio1 = await cardFolioService.getAllMainFolioCardPricesAndOccurrenceByDaysBefore(
      mainFolio1.id,
      7
    )

    assert.equal(resultFolio1.length, 2)
    const cardFolioIdsFolio1 = resultFolio1.map((cardFolio) => cardFolio.id)
    assert.includeMembers(cardFolioIdsFolio1, [cardFolio1.id, cardFolio2.id])
    assert.notIncludeMembers(cardFolioIdsFolio1, [cardFolio3.id, cardFolio4.id])

    const resultFolio2 = await cardFolioService.getAllMainFolioCardPricesAndOccurrenceByDaysBefore(
      mainFolio2.id,
      7
    )

    assert.equal(resultFolio2.length, 2)
    const cardFolioIdsFolio2 = resultFolio2.map((cardFolio) => cardFolio.id)
    assert.includeMembers(cardFolioIdsFolio2, [cardFolio3.id, cardFolio4.id])
    assert.notIncludeMembers(cardFolioIdsFolio2, [cardFolio1.id, cardFolio2.id])
  })

  test('getAllMainFolioCardPricesAndOccurrenceByDaysBefore - should filter prices by daysBefore parameter', async ({
    assert,
  }) => {
    const userId = TEST_AUTH_USER_ID

    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()

    const mainFolio = await FolioFactory.merge({
      userId,
      isRoot: true,
    }).create()

    const recentDate = DateTime.now().minus({ days: 3 })
    const oldDate = DateTime.now().minus({ days: 10 })

    const card = await CardFactory.with('cardMarketPrices', 2, (cardMarketPrices) =>
      cardMarketPrices.merge([
        { trendPrice: 10.5, updatedAt: recentDate },
        { trendPrice: 8.0, updatedAt: oldDate },
      ])
    )
      .with('tcgPlayerReportings', 2, (tcgPlayerReportings) =>
        tcgPlayerReportings.merge([
          { url: 'recent-url', updatedAt: recentDate },
          { url: 'old-url', updatedAt: oldDate },
        ])
      )
      .create()

    await CardFolioFactory.merge({
      cardId: card.id,
      folioId: mainFolio.id,
      occurrence: 1,
    }).create()

    const result = await cardFolioService.getAllMainFolioCardPricesAndOccurrenceByDaysBefore(
      mainFolio.id,
      7
    )

    assert.equal(result.length, 1)

    const preloadedCard = result[0].$preloaded.card as Card
    const cardMarketPrices = preloadedCard.$preloaded.cardMarketPrices as CardMarketPrice[]
    const tcgPlayerReportings = preloadedCard.$preloaded.tcgPlayerReportings as TcgPlayerReporting[]

    // Should only include prices from the last 7 days
    assert.equal(cardMarketPrices.length, 1)
    assert.equal(tcgPlayerReportings.length, 1)
  })

  test('getAllMainFolioCardPricesAndOccurrenceByDaysBefore - should return empty result for non-existent folio', async ({
    assert,
  }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()

    const result = await cardFolioService.getAllMainFolioCardPricesAndOccurrenceByDaysBefore(
      'non-existent-folio-id',
      7
    )

    assert.equal(result.length, 0)
  })

  test('getAllMainFolioCardPricesAndOccurrenceByDaysBefore - should handle cards without prices', async ({
    assert,
  }) => {
    const userId = TEST_AUTH_USER_ID

    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()

    const mainFolio = await FolioFactory.merge({
      userId,
      isRoot: true,
    }).create()

    const cardWithoutPrices = await CardFactory.create()

    await CardFolioFactory.merge({
      cardId: cardWithoutPrices.id,
      folioId: mainFolio.id,
      occurrence: 1,
    }).create()

    const result = await cardFolioService.getAllMainFolioCardPricesAndOccurrenceByDaysBefore(
      mainFolio.id,
      7
    )

    assert.equal(result.length, 1)

    const preloadedCard = result[0].$preloaded.card as Card
    const cardMarketPrices = preloadedCard.$preloaded.cardMarketPrices as CardMarketPrice[]
    const tcgPlayerReportings = preloadedCard.$preloaded.tcgPlayerReportings as TcgPlayerReporting[]

    assert.equal(cardMarketPrices.length, 0)
    assert.equal(tcgPlayerReportings.length, 0)
  })

  test('updateCardFolioOccurrence - should update occurrence for existing card folio', async ({
    assert,
  }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()

    const card = await CardFactory.create()
    const folio = await FolioFactory.create()

    const initialCardFolio = await CardFolioFactory.merge({
      cardId: card.id,
      folioId: folio.id,
      occurrence: 2,
    }).create()

    const updatedCardFolio = await cardFolioService.updateCardFolioOccurrence(card.id, folio.id, 5)

    assert.equal(updatedCardFolio.occurrence, 5)

    const reloadedCardFolio = await CardFolio.findOrFail(initialCardFolio.id)
    assert.equal(reloadedCardFolio.occurrence, 5)
  })

  test('updateCardFolioOccurrence - should throw error when card folio does not exist', async ({
    assert,
  }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()

    const card = await CardFactory.create()
    const folio = await FolioFactory.create()

    await assert.rejects(
      async () => await cardFolioService.updateCardFolioOccurrence(card.id, folio.id, 5),
      'Row not found'
    )
  })

  test('deleteCardFromFolioByCardIdAndFolioId - should delete card folio relationship', async ({
    assert,
  }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()

    const card = await CardFactory.create()
    const folio = await FolioFactory.create()

    await CardFolioFactory.merge({
      cardId: card.id,
      folioId: folio.id,
      occurrence: 2,
    }).create()

    await cardFolioService.deleteCardFromFolioByCardIdAndFolioId(card.id, folio.id)

    const deletedCardFolio = await CardFolio.query()
      .where('card_id', card.id)
      .where('folio_id', folio.id)
      .first()

    assert.isNull(deletedCardFolio)
  })

  test('deleteCardFromFolioByCardIdAndFolioId - should throw error when card folio does not exist', async ({
    assert,
  }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()

    const card = await CardFactory.create()
    const folio = await FolioFactory.create()

    await assert.rejects(
      async () => await cardFolioService.deleteCardFromFolioByCardIdAndFolioId(card.id, folio.id),
      'Row not found'
    )
  })

  test('deleteCardFromFolioByCardIdAndFolioId - should only delete the specified card folio relationship', async ({
    assert,
  }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()

    const card1 = await CardFactory.create()
    const card2 = await CardFactory.create()
    const folio1 = await FolioFactory.create()
    const folio2 = await FolioFactory.create()

    const cardFolio1 = await CardFolioFactory.merge({
      cardId: card1.id,
      folioId: folio1.id,
      occurrence: 2,
    }).create()

    const cardFolio2 = await CardFolioFactory.merge({
      cardId: card1.id,
      folioId: folio2.id,
      occurrence: 3,
    }).create()

    const cardFolio3 = await CardFolioFactory.merge({
      cardId: card2.id,
      folioId: folio1.id,
      occurrence: 1,
    }).create()

    await cardFolioService.deleteCardFromFolioByCardIdAndFolioId(card1.id, folio1.id)

    const deletedCardFolio1 = await CardFolio.find(cardFolio1.id)
    const existingCardFolio2 = await CardFolio.find(cardFolio2.id)
    const existingCardFolio3 = await CardFolio.find(cardFolio3.id)

    assert.isNull(deletedCardFolio1)
    assert.exists(existingCardFolio2)
    assert.exists(existingCardFolio3)
  })
})
