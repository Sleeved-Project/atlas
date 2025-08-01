import { test } from '@japa/runner'
import sinon from 'sinon'
import CardFolioMapper from '#mappers/card_folio_mapper'
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

  test('toFolioStatisticsOutputDTO - should return correct statistics for cards with prices', async ({
    assert,
  }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.merge({ id: 'base1' }).create()

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

    const lastCardFolios = [todayCardFolio1, todayCardFolio2]

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

    const dayBeforeLastCardFolios = [yesterdayCardFolio1, yesterdayCardFolio2]

    const result = CardFolioMapper.toFolioStatisticsOutputDTO(
      lastCardFolios,
      dayBeforeLastCardFolios
    )

    assert.equal(result.totalCardsCount, 3) // 2 + 1 occurrences
    assert.equal(result.cardMarketPrice, '35.00') // (10*2) + (15*1)
    assert.equal(result.tcgPlayerPrice, '36.00') // (8*2) + (20*1) - using lowest prices
    assert.equal(result.cardMarketTrending, 'up') // 35 > 28 (yesterday: 8*2 + 12*1)
    assert.equal(result.tcgPlayerTrending, 'up') // 36 > 30 (yesterday: 6*2 + 18*1)
  })

  test('toFolioStatisticsOutputDTO - should handle empty card folios', ({ assert }) => {
    const result = CardFolioMapper.toFolioStatisticsOutputDTO([], [])

    assert.equal(result.totalCardsCount, 0)
    assert.equal(result.cardMarketPrice, '0.00')
    assert.equal(result.tcgPlayerPrice, '0.00')
    assert.equal(result.cardMarketTrending, 'equal')
    assert.equal(result.tcgPlayerTrending, 'equal')
  })

  test('toFolioStatisticsOutputDTO - should handle cards without prices', async ({ assert }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.merge({ id: 'base1' }).create()

    const folio = await FolioFactory.create()
    const card = await CardFactory.create()

    const cardFolio = await CardFolioFactory.merge({
      cardId: card.id,
      folioId: folio.id,
      occurrence: 3,
    }).create()

    await cardFolio.load('card')

    const result = CardFolioMapper.toFolioStatisticsOutputDTO([cardFolio], [cardFolio])

    assert.equal(result.totalCardsCount, 3)
    assert.equal(result.cardMarketPrice, '0.00')
    assert.equal(result.tcgPlayerPrice, '0.00')
    assert.equal(result.cardMarketTrending, 'equal')
    assert.equal(result.tcgPlayerTrending, 'equal')
  })
})
