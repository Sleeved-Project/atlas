import { test } from '@japa/runner'
import sinon from 'sinon'
import { PriceTrending } from '#types/folio_type'
import { CardFactory } from '#database/factories/card'
import { CardFolioFactory } from '#database/factories/card_folio'
import { FolioFactory } from '#database/factories/folio'
import { ArtistFactory } from '#database/factories/artist'
import { RarityFactory } from '#database/factories/rarity'
import { LegalityFactory } from '#database/factories/legality'
import { SetFactory } from '#database/factories/set'
import testUtils from '@adonisjs/core/services/test_utils'
import PriceUtils from '#utils/price_utils'

test.group('PriceUtils', (group) => {
  let sandbox: sinon.SinonSandbox

  group.each.setup(() => {
    sandbox = sinon.createSandbox()
  })

  group.each.setup(() => testUtils.db().withGlobalTransaction())

  group.each.teardown(() => {
    sandbox.restore()
  })

  test('getPriceTrend - should return "up" when today price is higher', ({ assert }) => {
    const result = PriceUtils.getPriceTrend(100, 80)
    assert.equal(result, PriceTrending.UP)
  })

  test('getPriceTrend - should return "down" when today price is lower', ({ assert }) => {
    const result = PriceUtils.getPriceTrend(80, 100)
    assert.equal(result, PriceTrending.DOWN)
  })

  test('getPriceTrend - should return "equal" when prices are the same', ({ assert }) => {
    const result = PriceUtils.getPriceTrend(100, 100)
    assert.equal(result, PriceTrending.EQUAL)
  })

  test('getPriceTrend - should return "equal" when both prices are zero', ({ assert }) => {
    const result = PriceUtils.getPriceTrend(0, 0)
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

    const result = PriceUtils.getCardMarketTrendPrice([cardFolio1, cardFolio2])

    assert.equal(result, 68.25) // (10.5 * 2) + (15.75 * 3)
  })

  test('getCardMarketTrendPrice - should return 0 for empty array', ({ assert }) => {
    const result = PriceUtils.getCardMarketTrendPrice([])
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

    const result = PriceUtils.getCardMarketTrendPrice([cardFolio])
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

    const result = PriceUtils.getCardMarketTrendPrice([cardFolio])
    assert.equal(result, 0)
  })

  test('getLowerTcgPlayerMarketPrice - should return 0 for empty array', ({ assert }) => {
    const result = PriceUtils.getLowerTcgPlayerMarketPrice([])
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

    const result = PriceUtils.getLowerTcgPlayerMarketPrice([cardFolio])
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

    const result = PriceUtils.getLowerTcgPlayerMarketPrice([cardFolio])
    assert.equal(result, 0)
  })
})
