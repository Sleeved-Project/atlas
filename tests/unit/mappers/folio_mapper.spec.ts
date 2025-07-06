import { test } from '@japa/runner'
import sinon from 'sinon'
import FolioMapper from '#mappers/folio_mapper'
import { CardFactory } from '#database/factories/card'
import { CardFolioFactory } from '#database/factories/card_folio'
import { FolioFactory } from '#database/factories/folio'
import { ArtistFactory } from '#database/factories/artist'
import { RarityFactory } from '#database/factories/rarity'
import { LegalityFactory } from '#database/factories/legality'
import { SetFactory } from '#database/factories/set'
import testUtils from '@adonisjs/core/services/test_utils'
import { HasMany } from '@adonisjs/lucid/types/relations'
import CardFolio from '#models/card_folio'

test.group('FolioMapper', (group) => {
  let sandbox: sinon.SinonSandbox

  group.each.setup(() => {
    sandbox = sinon.createSandbox()
  })

  group.each.setup(() => testUtils.db().withGlobalTransaction())

  group.each.teardown(() => {
    sandbox.restore()
  })

  test('toFoliosWithStatistics - should return correct statistics for folios with prices', async ({
    assert,
  }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()

    const folio1 = await FolioFactory.merge({ name: 'Collection 1', image: 'image1.jpg' }).create()
    const folio2 = await FolioFactory.merge({ name: 'Collection 2', image: 'image2.jpg' }).create()

    const cards = await CardFactory.with('cardMarketPrices', 1, (cardMarketPrices) =>
      cardMarketPrices.merge({ trendPrice: 10.0 })
    )
      .with('tcgPlayerReportings', 1, (tcgPlayerReportings) =>
        tcgPlayerReportings.with('tcgPlayerPrices', 1, (tcgPlayerPrices) =>
          tcgPlayerPrices.merge({ type: 'normal', market: 8.0 })
        )
      )
      .createMany(3)

    const cardFolio1 = await CardFolioFactory.merge({
      cardId: cards[0].id,
      folioId: folio1.id,
      occurrence: 2,
    }).create()

    const cardFolio2 = await CardFolioFactory.merge({
      cardId: cards[1].id,
      folioId: folio1.id,
      occurrence: 3,
    }).create()

    const cardFolio3 = await CardFolioFactory.merge({
      cardId: cards[2].id,
      folioId: folio2.id,
      occurrence: 1,
    }).create()

    await cardFolio1.load('card', (cardQuery) => {
      cardQuery.preload('cardMarketPrices').preload('tcgPlayerReportings', (tcgQuery) => {
        tcgQuery.preload('tcgPlayerPrices')
      })
    })

    await cardFolio2.load('card', (cardQuery) => {
      cardQuery.preload('cardMarketPrices').preload('tcgPlayerReportings', (tcgQuery) => {
        tcgQuery.preload('tcgPlayerPrices')
      })
    })

    await cardFolio3.load('card', (cardQuery) => {
      cardQuery.preload('cardMarketPrices').preload('tcgPlayerReportings', (tcgQuery) => {
        tcgQuery.preload('tcgPlayerPrices')
      })
    })

    folio1.cardFolios = [cardFolio1, cardFolio2] as HasMany<typeof CardFolio>
    folio2.cardFolios = [cardFolio3] as HasMany<typeof CardFolio>

    const result = FolioMapper.toFoliosWithStatistics([folio1, folio2])

    assert.lengthOf(result, 2)

    // First folio
    assert.equal(result[0].id, folio1.id)
    assert.equal(result[0].name, 'Collection 1')
    assert.equal(result[0].image, 'image1.jpg')
    assert.equal(result[0].statistics.totalCardsCount, 5) // 2 + 3 occurrences
    assert.equal(result[0].statistics.cardMarketPrice, '50.00') // (10*2) + (10*3)
    assert.equal(result[0].statistics.tcgPlayerPrice, '40.00') // (8*2) + (8*3)

    // Second folio
    assert.equal(result[1].id, folio2.id)
    assert.equal(result[1].name, 'Collection 2')
    assert.equal(result[1].image, 'image2.jpg')
    assert.equal(result[1].statistics.totalCardsCount, 1) // 1 occurrence
    assert.equal(result[1].statistics.cardMarketPrice, '10.00') // 10*1
    assert.equal(result[1].statistics.tcgPlayerPrice, '8.00') // 8*1
  })

  test('toFoliosWithStatistics - should handle empty folios array', ({ assert }) => {
    const result = FolioMapper.toFoliosWithStatistics([])

    assert.lengthOf(result, 0)
    assert.deepEqual(result, [])
  })

  test('toFoliosWithStatistics - should handle folios without card folios', async ({ assert }) => {
    const folio = await FolioFactory.merge({
      name: 'Empty Collection',
      image: 'empty.jpg',
    }).create()

    folio.cardFolios = [] as unknown as HasMany<typeof CardFolio>

    const result = FolioMapper.toFoliosWithStatistics([folio])

    assert.lengthOf(result, 1)
    assert.equal(result[0].id, folio.id)
    assert.equal(result[0].name, 'Empty Collection')
    assert.equal(result[0].image, 'empty.jpg')
    assert.equal(result[0].statistics.totalCardsCount, 0)
    assert.equal(result[0].statistics.cardMarketPrice, '0.00')
    assert.equal(result[0].statistics.tcgPlayerPrice, '0.00')
  })

  test('toFoliosWithStatistics - should handle folios with cards without prices', async ({
    assert,
  }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()

    const folio = await FolioFactory.merge({ name: 'No Price Collection' }).create()
    const card = await CardFactory.create()

    const cardFolio = await CardFolioFactory.merge({
      cardId: card.id,
      folioId: folio.id,
      occurrence: 5,
    }).create()

    await cardFolio.load('card')

    folio.cardFolios = [cardFolio] as HasMany<typeof CardFolio>

    const result = FolioMapper.toFoliosWithStatistics([folio])

    assert.lengthOf(result, 1)
    assert.equal(result[0].statistics.totalCardsCount, 5)
    assert.equal(result[0].statistics.cardMarketPrice, '0.00')
    assert.equal(result[0].statistics.tcgPlayerPrice, '0.00')
  })
})
