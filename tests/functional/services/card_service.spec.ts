import { test } from '@japa/runner'
import CardService from '#services/card_service'
import testUtils from '@adonisjs/core/services/test_utils'
import Set from '#models/set'
import Subtype from '#models/subtypes'
import Artist from '#models/artist'
import Rarity from '#models/rarity'
import CardMarketPrice from '#models/card_market_price'
import TcgPlayerReporting from '#models/tcg_player_reporting'
import TcgPlayerPrice from '#models/tcg_player_price'
import { CardFactory } from '#database/factories/card'
import { ArtistFactory } from '#database/factories/artist'
import { RarityFactory } from '#database/factories/rarity'
import { LegalityFactory } from '#database/factories/legality'
import { SetFactory } from '#database/factories/set'
import { FolioFactory } from '#database/factories/folio'
import { TEST_AUTH_USER_ID } from '#tests/mocks/auth_service_mock'
import { CardFolioFactory } from '#database/factories/card_folio'
import CardFolio from '#models/card_folio'

test.group('CardService', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  let cardService: CardService

  group.setup(() => {
    cardService = new CardService()
  })

  test('getAllCards - should return paginated results with correct fields', async ({ assert }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()
    await CardFactory.createMany(15)

    const result = await cardService.getAllCards({ page: 1, limit: 10 })

    assert.equal(result.length, 10)
    assert.equal(result.currentPage, 1)

    const firstCard = result[0].$attributes
    assert.properties(firstCard, ['id', 'imageSmall'])
    assert.isUndefined(firstCard.name)
    assert.isUndefined(firstCard.number)
  })

  test('getAllCards - should sort by set release date and card number', async ({ assert }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()
    await CardFactory.merge([
      { id: 'base1-1', number: '1' },
      { id: 'base1-2', number: '2' },
      { id: 'base1-3', number: '3' },
    ]).createMany(3)

    const result = await cardService.getAllCards({ page: 1, limit: 10 })

    const cardIds = result.map((card) => card.id)

    assert.equal(cardIds[0], 'base1-1')
    assert.equal(cardIds[1], 'base1-2')
    assert.equal(cardIds[2], 'base1-3')
  })

  test('getAllCards - should filter by name correctly', async ({ assert }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()
    await CardFactory.merge({ name: 'Pikachu' }).create()

    const exactResult = await cardService.getAllCards({
      page: 1,
      limit: 10,
      name: 'Pikachu',
    })

    assert.isAtLeast(exactResult.length, 1)

    const partialResult = await cardService.getAllCards({
      page: 1,
      limit: 10,
      name: 'Pika',
    })

    assert.isAtLeast(partialResult.length, 1)

    const caseInsensitiveResult = await cardService.getAllCards({
      page: 1,
      limit: 10,
      name: 'pikachu',
    })

    assert.isAtLeast(caseInsensitiveResult.length, 1)

    const noMatchResult = await cardService.getAllCards({
      page: 1,
      limit: 10,
      name: 'NonExistentCard',
    })

    assert.equal(noMatchResult.length, 0)
  })

  test('getCardBaseById - should return a card base infos with all required fields', async ({
    assert,
  }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()
    await CardFactory.merge({ id: 'base1-3' }).create()

    const card = await cardService.getCardBaseById('base1-3')
    assert.properties(card.$attributes, ['id', 'imageLarge', 'number'])
  })

  test('getCardBaseById - should load related data correctly', async ({ assert }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()
    await CardFactory.merge({ id: 'base1-5' }).create()

    const card = await cardService.getCardBaseById('base1-5')
    assert.property(card.$preloaded, 'set')
    const set = card.$preloaded.set as Set
    assert.properties(set.$attributes, ['id', 'name', 'imageSymbol'])
  })

  test('getCardBaseById - should throw NotFoundException for non-existent card', async ({
    assert,
  }) => {
    await assert.rejects(() => cardService.getCardBaseById('non-existent-id'), 'Row not found')
  })

  test('getCardBaseById - should respect the selected fields only', async ({ assert }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()
    await CardFactory.merge({ id: 'base1-1' }).create()

    const card = await cardService.getCardBaseById('base1-1')
    assert.property(card.$attributes, 'id')
    assert.property(card.$attributes, 'imageLarge')
    assert.property(card.$attributes, 'number')
    assert.notProperty(card.$attributes, 'name')
    assert.notProperty(card.$attributes, 'imageSmall')
    assert.notProperty(card.$attributes, 'supertype')
    assert.notProperty(card.$attributes, 'hp')
    assert.notProperty(card.$attributes, 'convertedRetreatCost')
  })

  test('getCardDetailById - should return a card details with all required fields', async ({
    assert,
  }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()
    await CardFactory.merge({ id: 'base1-1' }).create()

    const card = await cardService.getCardDetailById('base1-1')
    assert.properties(card.$attributes, ['id', 'flavorText'])
  })

  test('getCardDetailById - should load related data correctly', async ({ assert }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()
    await CardFactory.merge({ id: 'base1-1' }).with('subtypes').create()

    const card = await cardService.getCardDetailById('base1-1')
    assert.property(card.$preloaded, 'set')
    assert.property(card.$preloaded, 'rarity')
    assert.property(card.$preloaded, 'artist')
    assert.property(card.$preloaded, 'subtypes')
    const set = card.$preloaded.set as Set
    const rarity = card.$preloaded.rarity as Rarity
    const artist = card.$preloaded.artist as Artist
    const subtypes = card.$preloaded.subtypes as Subtype[]
    assert.properties(set.$attributes, ['id', 'releaseDate'])
    assert.properties(rarity.$attributes, ['id', 'label'])
    assert.properties(artist.$attributes, ['id', 'name'])
    assert.isArray(subtypes)
    assert.properties(subtypes[0].$attributes, ['id', 'label'])
  })

  test('getCardDetailById - should throw NotFoundException for non-existent card', async ({
    assert,
  }) => {
    await assert.rejects(() => cardService.getCardDetailById('non-existent-id'), 'Row not found')
  })

  test('getCardDetailById - should respect the selected fields only', async ({ assert }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()
    await CardFactory.merge({ id: 'base1-1' }).create()

    const card = await cardService.getCardDetailById('base1-1')
    assert.property(card.$attributes, 'id')
    assert.property(card.$attributes, 'flavorText')
    assert.notProperty(card.$attributes, 'imageSmall')
    assert.notProperty(card.$attributes, 'imageLarge')
    assert.notProperty(card.$attributes, 'number')
    assert.notProperty(card.$attributes, 'name')
    assert.notProperty(card.$attributes, 'supertype')
    assert.notProperty(card.$attributes, 'hp')
    assert.notProperty(card.$attributes, 'convertedRetreatCost')
  })

  test('getTodayCardPricesById - should return a card with price data', async ({ assert }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()
    const cardMock = await CardFactory.merge({ id: 'base1-1' })
      .with('cardMarketPrices', 1, (cardMarketPrices) =>
        cardMarketPrices.merge({
          id: 1234567890,
          url: 'https://cardmarket.com/base1-0',
          trendPrice: 10.5,
          reverseHoloTrend: 15.75,
          cardId: 'base1-1',
        })
      )
      .with('tcgPlayerReportings', 1, (tcgPlayerReportings) =>
        tcgPlayerReportings
          .merge({
            id: 1234567890,
            url: 'https://tcgplayer.com/base1-0',
            cardId: 'base1-1',
          })
          .with('tcgPlayerPrices', 2, (tcgPlayerPrices) =>
            tcgPlayerPrices.merge([
              { id: 1234567890, type: 'normal', market: 10.5 },
              { id: 1234567891, type: 'holofoil', market: 15.75 },
            ])
          )
      )
      .create()

    const card = await cardService.getTodayCardPricesById(cardMock.id)

    assert.property(card.$attributes, 'id')
    assert.equal(card.$attributes.id, 'base1-1')

    assert.property(card.$preloaded, 'cardMarketPrices')
    const cardMarketPrices = card.$preloaded.cardMarketPrices as CardMarketPrice[]
    assert.isArray(cardMarketPrices)
    assert.properties(cardMarketPrices[0].$attributes, [
      'id',
      'trendPrice',
      'reverseHoloTrend',
      'url',
    ])

    assert.property(card.$preloaded, 'tcgPlayerReportings')
    const tcgPlayerReportings = card.$preloaded.tcgPlayerReportings as TcgPlayerReporting[]
    assert.isArray(tcgPlayerReportings)
    const firstReporting = tcgPlayerReportings[0]
    assert.properties(firstReporting.$attributes, ['id', 'url'])

    assert.property(firstReporting.$preloaded, 'tcgPlayerPrices')
    const tcgPlayerPrices = firstReporting.$preloaded.tcgPlayerPrices as TcgPlayerPrice[]
    assert.isArray(tcgPlayerPrices)
    assert.properties(tcgPlayerPrices[0].$attributes, ['id', 'type', 'market'])
  })

  test('getTodayCardPricesById - should throw NotFoundException for non-existent card', async ({
    assert,
  }) => {
    await assert.rejects(
      () => cardService.getTodayCardPricesById('non-existent-id'),
      'Row not found'
    )
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
      folioId: secondaryFolio.id,
      occurrence: 3,
    }).create()

    const result = await cardService.getAllMainFolioCards({ page: 1, limit: 10 }, mainFolio.id)

    assert.equal(result.length, 2)
    assert.equal(result.currentPage, 1)

    const cardIds = result.map((card) => card.id)
    assert.includeMembers(cardIds, [cards[0].id, cards[1].id])
    assert.notIncludeMembers(cardIds, [cards[2].id])

    const firstCard = result[0].$attributes
    assert.properties(firstCard, ['id', 'imageSmall'])
    assert.isUndefined(firstCard.name)
    assert.isUndefined(firstCard.number)

    assert.property(result[0].$preloaded, 'cardFolios')
    const cardFolios = result[0].$preloaded.cardFolios as CardFolio[]
    assert.isArray(cardFolios)
    assert.properties(cardFolios[0].$attributes, ['occurrence', 'cardId'])
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

    await CardFolioFactory.merge({
      cardId: cards[0].id,
      folioId: mainFolio1.id,
      occurrence: 1,
    }).create()

    await CardFolioFactory.merge({
      cardId: cards[1].id,
      folioId: mainFolio1.id,
      occurrence: 2,
    }).create()

    await CardFolioFactory.merge({
      cardId: cards[2].id,
      folioId: mainFolio2.id,
      occurrence: 1,
    }).create()

    await CardFolioFactory.merge({
      cardId: cards[3].id,
      folioId: mainFolio2.id,
      occurrence: 3,
    }).create()

    const resultUser1 = await cardService.getAllMainFolioCards(
      { page: 1, limit: 10 },
      mainFolio1.id
    )

    assert.equal(resultUser1.length, 2)
    const cardIdsUser1 = resultUser1.map((card) => card.id)
    assert.includeMembers(cardIdsUser1, [cards[0].id, cards[1].id])
    assert.notIncludeMembers(cardIdsUser1, [cards[2].id, cards[3].id])

    const resultUser2 = await cardService.getAllMainFolioCards(
      { page: 1, limit: 10 },
      mainFolio2.id
    )

    assert.equal(resultUser2.length, 2)
    const cardIdsUser2 = resultUser2.map((card) => card.id)
    assert.includeMembers(cardIdsUser2, [cards[2].id, cards[3].id])
    assert.notIncludeMembers(cardIdsUser2, [cards[0].id, cards[1].id])
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

    const cards = await CardFactory.merge([
      { id: 'base1-3', number: '3' },
      { id: 'base1-1', number: '1' },
      { id: 'base1-2', number: '2' },
    ]).createMany(3)

    for (const card of cards) {
      await CardFolioFactory.merge({
        cardId: card.id,
        folioId: mainFolio.id,
        occurrence: 1,
      }).create()
    }

    const result = await cardService.getAllMainFolioCards({ page: 1, limit: 10 }, mainFolio.id)

    const cardIds = result.map((card) => card.id)

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

    const page1 = await cardService.getAllMainFolioCards({ page: 1, limit: 10 }, mainFolio.id)

    assert.equal(page1.length, 10)
    assert.equal(page1.currentPage, 1)

    const page2 = await cardService.getAllMainFolioCards({ page: 2, limit: 10 }, mainFolio.id)

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

    const result = await cardService.getAllMainFolioCards(
      { page: 1, limit: 10 },
      'non-existent-folio-id'
    )

    assert.equal(result.length, 0)
  })
})
