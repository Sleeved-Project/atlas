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
import { SubtypeFactory } from '#database/factories/subtype'
import { TypeFactory } from '#database/factories/type'
import { CardFolioFactory } from '#database/factories/card_folio'
import CardFolio from '#models/card_folio'
import { FolioFactory } from '#database/factories/folio'
import { TEST_AUTH_USER_ID } from '#tests/mocks/auth_service_mock'

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

    const userId = TEST_AUTH_USER_ID

    const result = await cardService.getAllCards({ page: 1, limit: 10 }, userId)

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

    const userId = TEST_AUTH_USER_ID

    const result = await cardService.getAllCards({ page: 1, limit: 10 }, userId)

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

    const userId = TEST_AUTH_USER_ID

    const exactResult = await cardService.getAllCards(
      {
        page: 1,
        limit: 10,
        name: 'Pikachu',
      },
      userId
    )

    assert.isAtLeast(exactResult.length, 1)

    const partialResult = await cardService.getAllCards(
      {
        page: 1,
        limit: 10,
        name: 'Pika',
      },
      userId
    )

    assert.isAtLeast(partialResult.length, 1)

    const caseInsensitiveResult = await cardService.getAllCards(
      {
        page: 1,
        limit: 10,
        name: 'pikachu',
      },
      userId
    )

    assert.isAtLeast(caseInsensitiveResult.length, 1)

    const noMatchResult = await cardService.getAllCards(
      {
        page: 1,
        limit: 10,
        name: 'NonExistentCard',
      },
      userId
    )

    assert.equal(noMatchResult.length, 0)
  })

  test('getAllCards - should filter by rarity correctly', async ({ assert }) => {
    await LegalityFactory.create()
    await SetFactory.create()

    const userId = TEST_AUTH_USER_ID

    const commonRarity = await RarityFactory.merge({ id: 1, label: 'Common' }).create()
    const rareRarity = await RarityFactory.merge({ id: 2, label: 'Rare' }).create()
    const artist = await ArtistFactory.create()

    const commonCard = await CardFactory.merge({
      name: 'Common Card',
      rarityId: commonRarity.id,
      artistId: artist.id,
    }).create()

    await CardFactory.merge({
      name: 'Rare Card',
      rarityId: rareRarity.id,
      artistId: artist.id,
    }).create()

    const result = await cardService.getAllCards(
      {
        page: 1,
        limit: 10,
        rarity: [commonRarity.id.toString()],
      },
      userId
    )

    assert.equal(result.length, 1)
    const cardResult = result[0]
    assert.equal(cardResult.id, commonCard.id)
  })

  test('getAllCards - should filter by artist correctly', async ({ assert }) => {
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()

    const userId = TEST_AUTH_USER_ID

    const artist1 = await ArtistFactory.merge({ id: 1, name: 'Artist One' }).create()
    const artist2 = await ArtistFactory.merge({ id: 2, name: 'Artist Two' }).create()

    const artist1Card = await CardFactory.merge({
      name: 'Card by Artist One',
      artistId: artist1.id,
    }).create()

    await CardFactory.merge({
      name: 'Card by Artist Two',
      artistId: artist2.id,
    }).create()

    const result = await cardService.getAllCards(
      {
        page: 1,
        limit: 10,
        artist: [artist1.id.toString()],
      },
      userId
    )

    assert.equal(result.length, 1)
    const cardResult = result[0]
    assert.equal(cardResult.id, artist1Card.id)
  })

  test('getAllCards - should filter by subtype correctly', async ({ assert }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()

    const userId = TEST_AUTH_USER_ID

    const basicSubtype = await SubtypeFactory.merge({ id: 1, label: 'Basic' }).create()
    const stage1Subtype = await SubtypeFactory.merge({ id: 2, label: 'Stage 1' }).create()

    const basicCard = await CardFactory.merge({
      name: 'Basic Card',
    })
      .with('subtypes', 1, (subtypes) => subtypes.merge([basicSubtype]))
      .create()

    await CardFactory.merge({
      name: 'Stage 1 Card',
    })
      .with('subtypes', 1, (subtypes) => subtypes.merge([stage1Subtype]))
      .create()

    const result = await cardService.getAllCards(
      {
        page: 1,
        limit: 10,
        subtype: [basicSubtype.id.toString()],
      },
      userId
    )

    assert.equal(result.length, 1)
    const cardResult = await result[0]
    assert.equal(cardResult.id, basicCard.id)
  })

  test('getAllCards - should filter by type correctly', async ({ assert }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()

    const userId = TEST_AUTH_USER_ID

    const psychicType = await TypeFactory.merge({ id: 1, label: 'Psychic' }).create()
    const fireType = await TypeFactory.merge({ id: 2, label: 'Fire' }).create()

    const pysCard = await CardFactory.merge({
      name: 'Psychic Card',
    })
      .with('types', 1, (types) => types.merge([psychicType]))
      .create()

    await CardFactory.merge({
      name: 'Fire Card',
    })
      .with('types', 1, (types) => types.merge([fireType]))
      .create()

    const result = await cardService.getAllCards(
      {
        page: 1,
        limit: 10,
        type: [psychicType.id.toString()],
      },
      userId
    )

    assert.equal(result.length, 1)

    // Vérifier que la carte retournée a le bon type
    const cardResult = await result[0]
    assert.equal(cardResult.id, pysCard.id)
  })

  test('getAllCards - should apply multiple filters simultaneously', async ({ assert }) => {
    await LegalityFactory.create()
    await SetFactory.create()

    const userId = TEST_AUTH_USER_ID

    const commonRarity = await RarityFactory.merge({ id: 1, label: 'Common' }).create()
    const rareRarity = await RarityFactory.merge({ id: 2, label: 'Rare' }).create()
    const artist1 = await ArtistFactory.merge({ id: 1, name: 'Artist One' }).create()

    // Carte qui match tous les critères
    const matchingCard = await CardFactory.merge({
      name: 'Pikachu Common',
      rarityId: commonRarity.id,
      artistId: artist1.id,
    }).create()

    // Cartes qui ne matchent pas tous les critères
    await CardFactory.merge({
      name: 'Charizard Common',
      rarityId: commonRarity.id,
      artistId: artist1.id,
    }).create()

    await CardFactory.merge({
      name: 'Pikachu Rare',
      rarityId: rareRarity.id,
      artistId: artist1.id,
    }).create()

    const result = await cardService.getAllCards(
      {
        page: 1,
        limit: 10,
        name: 'Pika',
        rarity: [commonRarity.id.toString()],
      },
      userId
    )

    assert.equal(result.length, 1)

    const cardResult = result[0]
    assert.equal(cardResult.id, matchingCard.id)
  })

  test('getAllCards - should return empty result when no cards match filters', async ({
    assert,
  }) => {
    await ArtistFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()

    const userId = TEST_AUTH_USER_ID

    const commonRarity = await RarityFactory.merge({ id: 1, label: 'Common' }).create()

    await CardFactory.merge({
      name: 'Pikachu',
      rarityId: commonRarity.id,
    }).create()

    const result = await cardService.getAllCards(
      {
        page: 1,
        limit: 10,
        name: 'NonExistentCard',
        rarity: [commonRarity.id.toString()],
      },
      userId
    )

    assert.equal(result.length, 0)
  })

  test('getCardIdById - should return a card id if is present', async ({ assert }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()
    await CardFactory.merge({ id: 'base1-3' }).create()

    const card = await cardService.getCardIdById('base1-3')
    assert.properties(card.$attributes, ['id'])
  })

  test('getCardIdById - should return a card id if is present', async ({ assert }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()
    await CardFactory.merge({ id: 'base1-3' }).create()

    const card = await cardService.getCardIdById('base1-3')
    assert.properties(card.$attributes, ['id'])
  })
  test('getCardIdById - should throw NotFoundException for non-existent card', async ({
    assert,
  }) => {
    await assert.rejects(() => cardService.getCardIdById('non-existent-id'), 'Row not found')
  })

  test('getCardBasesByIdAndUserId - should return a card base infos with all required fields', async ({
    assert,
  }) => {
    const userId = '123'

    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()
    await CardFactory.merge({ id: 'base1-3' }).create()

    const card = await cardService.getCardBasesByIdAndUserId('base1-3', userId)
    assert.properties(card.$attributes, ['id', 'imageLarge', 'number'])
  })

  test('getCardBasesByIdAndUserId - should load related data correctly', async ({ assert }) => {
    const userId = '123'

    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()
    await CardFactory.merge({ id: 'base1-5' }).create()

    const card = await cardService.getCardBasesByIdAndUserId('base1-5', userId)
    assert.property(card.$preloaded, 'set')
    const set = card.$preloaded.set as Set
    assert.properties(set.$attributes, ['id', 'name', 'imageSymbol'])
  })

  test('getCardBasesByIdAndUserId - should throw NotFoundException for non-existent card', async ({
    assert,
  }) => {
    const userId = '123'
    await assert.rejects(
      () => cardService.getCardBasesByIdAndUserId('non-existent-id', userId),
      'Row not found'
    )
  })

  test('getCardBasesByIdAndUserId - should respect the selected fields only', async ({
    assert,
  }) => {
    const userId = '123'

    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()
    await CardFactory.merge({ id: 'base1-1' }).create()

    const card = await cardService.getCardBasesByIdAndUserId('base1-1', userId)
    assert.property(card.$attributes, 'id')
    assert.property(card.$attributes, 'imageLarge')
    assert.property(card.$attributes, 'number')
    assert.notProperty(card.$attributes, 'name')
    assert.notProperty(card.$attributes, 'imageSmall')
    assert.notProperty(card.$attributes, 'supertype')
    assert.notProperty(card.$attributes, 'hp')
    assert.notProperty(card.$attributes, 'convertedRetreatCost')
  })

  test('getCardBasesByIdAndUserId - should load cardFolios with correct occurrence for user root folio', async ({
    assert,
  }) => {
    const userId = '123'

    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()

    const card = await CardFactory.merge({ id: 'base1-10' }).create()

    // Créer un folio root pour l'utilisateur
    const rootFolio = await FolioFactory.merge({
      userId: userId,
      isRoot: true,
      name: 'My Collection',
    }).create()

    // Créer un cardFolio avec une occurrence spécifique
    await CardFolioFactory.merge({
      cardId: card.id,
      folioId: rootFolio.id,
      occurrence: 3,
    }).create()

    const result = await cardService.getCardBasesByIdAndUserId('base1-10', userId)

    assert.property(result.$preloaded, 'cardFolios')
    const cardFolios = result.$preloaded.cardFolios as CardFolio[]
    assert.isArray(cardFolios)
    assert.lengthOf(cardFolios, 1)
    assert.equal(cardFolios[0].occurrence, 3)
  })

  test('getCardBasesByIdAndUserId - should return empty cardFolios when user has no cards in root folio', async ({
    assert,
  }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()

    const userId = '123'
    await CardFactory.merge({ id: 'base1-11' }).create()

    const result = await cardService.getCardBasesByIdAndUserId('base1-11', userId)

    assert.property(result.$preloaded, 'cardFolios')
    const cardFolios = result.$preloaded.cardFolios as CardFolio[]
    assert.isArray(cardFolios)
    assert.lengthOf(cardFolios, 0)
  })

  test('getCardBasesByIdAndUserId - should only load cardFolios from user root folio, not other folios', async ({
    assert,
  }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()

    const userId1 = '123'
    const userId2 = '456'
    const card = await CardFactory.merge({ id: 'base1-12' }).create()

    // Créer des folios pour les deux utilisateurs
    const user1RootFolio = await FolioFactory.merge({
      userId: userId1,
      isRoot: true,
    }).create()

    const user2RootFolio = await FolioFactory.merge({
      userId: userId2,
      isRoot: true,
    }).create()

    const user1NonRootFolio = await FolioFactory.merge({
      userId: userId1,
      isRoot: false,
    }).create()

    // Ajouter la carte dans différents folios
    await CardFolioFactory.merge({
      cardId: card.id,
      folioId: user1RootFolio.id,
      occurrence: 2,
    }).create()

    await CardFolioFactory.merge({
      cardId: card.id,
      folioId: user2RootFolio.id,
      occurrence: 5,
    }).create()

    await CardFolioFactory.merge({
      cardId: card.id,
      folioId: user1NonRootFolio.id,
      occurrence: 10,
    }).create()

    const result = await cardService.getCardBasesByIdAndUserId('base1-12', userId1)

    assert.property(result.$preloaded, 'cardFolios')
    const cardFolios = result.$preloaded.cardFolios as CardFolio[]
    assert.isArray(cardFolios)
    assert.lengthOf(cardFolios, 1)
    assert.equal(cardFolios[0].occurrence, 2) // Seulement celle du root folio de userId1
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

  test('getAllCardsBySetIdAndPaginate - should return paginated results for a specific set', async ({
    assert,
  }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()
    await CardFactory.merge({ setId: 'base1' }).createMany(15)

    const result = await cardService.getAllCardsBySetIdAndPaginate({ page: 1, limit: 10 }, 'base1')

    assert.equal(result.length, 10)
    assert.equal(result.currentPage, 1)
    const firstCard = result[0].$attributes
    assert.properties(firstCard, ['id', 'imageSmall'])
    assert.isUndefined(firstCard.name)
    assert.isUndefined(firstCard.number)
  })

  test('getAllCardsBySetIdAndPaginate - should filter by name correctly', async ({ assert }) => {
    await ArtistFactory.create()
    await RarityFactory.create()
    await LegalityFactory.create()
    await SetFactory.create()
    await CardFactory.merge({ name: 'Pikachu' }).create()

    const exactResult = await cardService.getAllCardsBySetIdAndPaginate(
      {
        page: 1,
        limit: 10,
        name: 'Pikachu',
      },
      'base1'
    )

    assert.isAtLeast(exactResult.length, 1)

    const partialResult = await cardService.getAllCardsBySetIdAndPaginate(
      {
        page: 1,
        limit: 10,
        name: 'Pika',
      },
      'base1'
    )

    assert.isAtLeast(partialResult.length, 1)

    const caseInsensitiveResult = await cardService.getAllCardsBySetIdAndPaginate(
      {
        page: 1,
        limit: 10,
        name: 'pikachu',
      },
      'base1'
    )

    assert.isAtLeast(caseInsensitiveResult.length, 1)

    const noMatchResult = await cardService.getAllCardsBySetIdAndPaginate(
      {
        page: 1,
        limit: 10,
        name: 'NonExistentCard',
      },
      'base1'
    )

    assert.equal(noMatchResult.length, 0)
  })
})
