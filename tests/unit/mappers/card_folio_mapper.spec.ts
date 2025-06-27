import { test } from '@japa/runner'
import sinon from 'sinon'
import CardFolioMapper from '#mappers/card_folio_mapper'
import { PriceTrending } from '#types/folio_type'
import { CardFactory } from '#database/factories/card'
import { CardFolioFactory } from '#database/factories/card_folio'
import { FolioFactory } from '#database/factories/folio'
import { ArtistFactory } from '#database/factories/artist'
import { RarityFactory } from '#database/factories/rarity'
import { LegalityFactory } from '#database/factories/legality'
import { SetFactory } from '#database/factories/set'
import TcgPlayerPrice from '#models/tcg_player_price'
import { HasMany } from '@adonisjs/lucid/types/relations'
import testUtils from '@adonisjs/core/services/test_utils'

test.group('CardFolioMapper', (group) => {
  let sandbox: sinon.SinonSandbox

  group.each.setup(() => {
    sandbox = sinon.createSandbox()
  })

  group.each.setup(() => testUtils.db().withGlobalTransaction())

  group.each.teardown(() => {
    sandbox.restore()
  })

  test('toFolioStatistics - should return correct statistics for cards with prices', async ({
    assert,
  }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()

    const folio = await FolioFactory.create()

    const todayCards = await CardFactory.with('cardMarketPrices', 1, (cardMarketPrices) =>
      cardMarketPrices.merge({
        trendPrice: 10.0,
      })
    )
      .with('tcgPlayerReportings', 1, (tcgPlayerReportings) =>
        tcgPlayerReportings.with('tcgPlayerPrices', 2, (tcgPlayerPrices) =>
          tcgPlayerPrices.merge([
            { type: 'normal', market: 8.0 },
            { type: 'holofoil', market: 12.0 },
          ])
        )
      )
      .createMany(2)

    const todayCardFolio1 = await CardFolioFactory.merge({
      cardId: todayCards[0].id,
      folioId: folio.id,
      occurrence: 2,
    }).create()

    const todayCardFolio2 = await CardFolioFactory.merge({
      cardId: todayCards[1].id,
      folioId: folio.id,
      occurrence: 1,
    }).create()

    await todayCardFolio1.load('card', (cardQuery) => {
      cardQuery.preload('cardMarketPrices').preload('tcgPlayerReportings', (tcgQuery) => {
        tcgQuery.preload('tcgPlayerPrices')
      })
    })

    await todayCardFolio2.load('card', (cardQuery) => {
      cardQuery.preload('cardMarketPrices').preload('tcgPlayerReportings', (tcgQuery) => {
        tcgQuery.preload('tcgPlayerPrices')
      })
    })

    todayCardFolio2.card.cardMarketPrices[0].trendPrice = 15.0
    todayCardFolio2.card.tcgPlayerReportings[0].tcgPlayerPrices = [
      { type: 'normal', market: 20.0 },
    ] as HasMany<typeof TcgPlayerPrice>

    const todayCardFolios = [todayCardFolio1, todayCardFolio2]

    const yesterdayCards = await CardFactory.with('cardMarketPrices', 1, (cardMarketPrices) =>
      cardMarketPrices.merge({
        trendPrice: 8.0,
      })
    )
      .with('tcgPlayerReportings', 1, (tcgPlayerReportings) =>
        tcgPlayerReportings.with('tcgPlayerPrices', 1, (tcgPlayerPrices) =>
          tcgPlayerPrices.merge({ type: 'normal', market: 6.0 })
        )
      )
      .createMany(2)

    const yesterdayCardFolio1 = await CardFolioFactory.merge({
      cardId: yesterdayCards[0].id,
      folioId: folio.id,
      occurrence: 2,
    }).create()

    const yesterdayCardFolio2 = await CardFolioFactory.merge({
      cardId: yesterdayCards[1].id,
      folioId: folio.id,
      occurrence: 1,
    }).create()

    await yesterdayCardFolio1.load('card', (cardQuery) => {
      cardQuery.preload('cardMarketPrices').preload('tcgPlayerReportings', (tcgQuery) => {
        tcgQuery.preload('tcgPlayerPrices')
      })
    })

    await yesterdayCardFolio2.load('card', (cardQuery) => {
      cardQuery.preload('cardMarketPrices').preload('tcgPlayerReportings', (tcgQuery) => {
        tcgQuery.preload('tcgPlayerPrices')
      })
    })

    yesterdayCardFolio2.card.cardMarketPrices[0].trendPrice = 12.0
    yesterdayCardFolio2.card.tcgPlayerReportings[0].tcgPlayerPrices = [
      { type: 'normal', market: 18.0 },
    ] as HasMany<typeof TcgPlayerPrice>

    const yesterdayCardFolios = [yesterdayCardFolio1, yesterdayCardFolio2]

    const result = CardFolioMapper.toFolioStatistics(todayCardFolios, yesterdayCardFolios)

    assert.equal(result.totalCardsCount, 3) // 2 + 1 occurrences
    assert.equal(result.cardMarketPrice, '35.00') // (10*2) + (15*1)
    assert.equal(result.tcgPlayerPrice, '36.00') // (8*2) + (20*1) - using lowest prices
    assert.equal(result.cardMarketTrending, 'up') // 35 > 28 (yesterday: 8*2 + 12*1)
    assert.equal(result.tcgPlayerTrending, 'up') // 36 > 30 (yesterday: 6*2 + 18*1)
  })

  test('toFolioStatistics - should handle empty card folios', ({ assert }) => {
    const result = CardFolioMapper.toFolioStatistics([], [])

    assert.equal(result.totalCardsCount, 0)
    assert.equal(result.cardMarketPrice, '0.00')
    assert.equal(result.tcgPlayerPrice, '0.00')
    assert.equal(result.cardMarketTrending, 'equal')
    assert.equal(result.tcgPlayerTrending, 'equal')
  })

  test('toFolioStatistics - should handle cards without prices', async ({ assert }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()

    const folio = await FolioFactory.create()
    const card = await CardFactory.create()

    const cardFolio = await CardFolioFactory.merge({
      cardId: card.id,
      folioId: folio.id,
      occurrence: 3,
    }).create()

    await cardFolio.load('card')

    const result = CardFolioMapper.toFolioStatistics([cardFolio], [cardFolio])

    assert.equal(result.totalCardsCount, 3)
    assert.equal(result.cardMarketPrice, '0.00')
    assert.equal(result.tcgPlayerPrice, '0.00')
    assert.equal(result.cardMarketTrending, 'equal')
    assert.equal(result.tcgPlayerTrending, 'equal')
  })

  test('getPriceTrend - should return "up" when today price is higher', ({ assert }) => {
    const result = CardFolioMapper.getPriceTrend(100, 80)
    assert.equal(result, PriceTrending.UP)
  })

  test('getPriceTrend - should return "down" when today price is lower', ({ assert }) => {
    const result = CardFolioMapper.getPriceTrend(80, 100)
    assert.equal(result, PriceTrending.DOWN)
  })

  test('getPriceTrend - should return "equal" when prices are the same', ({ assert }) => {
    const result = CardFolioMapper.getPriceTrend(100, 100)
    assert.equal(result, PriceTrending.EQUAL)
  })

  test('getPriceTrend - should return "equal" when both prices are zero', ({ assert }) => {
    const result = CardFolioMapper.getPriceTrend(0, 0)
    assert.equal(result, PriceTrending.EQUAL)
  })

  test('getCardMarketTrendPrice - should calculate total price with occurrences', async ({
    assert,
  }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()

    const folio = await FolioFactory.create()

    const cards = await CardFactory.with('cardMarketPrices', 1, (cardMarketPrices) =>
      cardMarketPrices.merge({
        trendPrice: 10.5,
      })
    ).createMany(2)

    const cardFolio1 = await CardFolioFactory.merge({
      cardId: cards[0].id,
      folioId: folio.id,
      occurrence: 2,
    }).create()

    const cardFolio2 = await CardFolioFactory.merge({
      cardId: cards[1].id,
      folioId: folio.id,
      occurrence: 3,
    }).create()

    await cardFolio1.load('card', (cardQuery) => {
      cardQuery.preload('cardMarketPrices')
    })

    await cardFolio2.load('card', (cardQuery) => {
      cardQuery.preload('cardMarketPrices')
    })

    cardFolio2.card.cardMarketPrices[0].trendPrice = 15.75

    const result = CardFolioMapper.getCardMarketTrendPrice([cardFolio1, cardFolio2])

    assert.equal(result, 68.25) // (10.5 * 2) + (15.75 * 3)
  })

  test('getCardMarketTrendPrice - should return 0 for empty array', ({ assert }) => {
    const result = CardFolioMapper.getCardMarketTrendPrice([])
    assert.equal(result, 0)
  })

  test('getCardMarketTrendPrice - should handle null trendPrice', async ({ assert }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()

    const folio = await FolioFactory.create()
    const card = await CardFactory.with('cardMarketPrices', 1, (cardMarketPrices) =>
      cardMarketPrices.merge({
        trendPrice: null,
      })
    ).create()

    const cardFolio = await CardFolioFactory.merge({
      cardId: card.id,
      folioId: folio.id,
      occurrence: 2,
    }).create()

    await cardFolio.load('card', (cardQuery) => {
      cardQuery.preload('cardMarketPrices')
    })

    const result = CardFolioMapper.getCardMarketTrendPrice([cardFolio])
    assert.equal(result, 0)
  })

  test('getCardMarketTrendPrice - should handle missing cardMarketPrices', async ({ assert }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()

    const folio = await FolioFactory.create()
    const card = await CardFactory.create()

    const cardFolio = await CardFolioFactory.merge({
      cardId: card.id,
      folioId: folio.id,
      occurrence: 2,
    }).create()

    await cardFolio.load('card')

    const result = CardFolioMapper.getCardMarketTrendPrice([cardFolio])
    assert.equal(result, 0)
  })

  test('getLowerTcgPlayerMarketPrice - should return 0 for empty array', ({ assert }) => {
    const result = CardFolioMapper.getLowerTcgPlayerMarketPrice([])
    assert.equal(result, 0)
  })

  test('getLowerTcgPlayerMarketPrice - should handle empty tcgPlayerPrices', async ({ assert }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()

    const folio = await FolioFactory.create()
    const card = await CardFactory.with('tcgPlayerReportings', 1).create()

    const cardFolio = await CardFolioFactory.merge({
      cardId: card.id,
      folioId: folio.id,
      occurrence: 2,
    }).create()

    await cardFolio.load('card', (cardQuery) => {
      cardQuery.preload('tcgPlayerReportings', (tcgQuery) => {
        tcgQuery.preload('tcgPlayerPrices')
      })
    })

    const result = CardFolioMapper.getLowerTcgPlayerMarketPrice([cardFolio])
    assert.equal(result, 0)
  })

  test('getLowerTcgPlayerMarketPrice - should handle missing tcgPlayerReportings', async ({
    assert,
  }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()

    const folio = await FolioFactory.create()
    const card = await CardFactory.create()

    const cardFolio = await CardFolioFactory.merge({
      cardId: card.id,
      folioId: folio.id,
      occurrence: 2,
    }).create()

    await cardFolio.load('card')

    const result = CardFolioMapper.getLowerTcgPlayerMarketPrice([cardFolio])
    assert.equal(result, 0)
  })
})
