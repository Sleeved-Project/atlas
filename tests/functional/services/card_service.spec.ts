import { test } from '@japa/runner'
import CardService from '#services/card_service'
import testUtils from '@adonisjs/core/services/test_utils'
import Set from '#models/set'
import Subtype from '#models/subtypes'
import Artist from '#models/artist'
import Rarity from '#models/rarity'

test.group('CardService', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  let cardService: CardService

  group.setup(() => {
    cardService = new CardService()
  })

  test('getAllCards - should return paginated results with correct fields', async ({ assert }) => {
    const result = await cardService.getAllCards({ page: 1, limit: 10 })

    assert.equal(result.length, 10)
    assert.equal(result.currentPage, 1)

    const firstCard = result[0].$attributes
    assert.properties(firstCard, ['id', 'imageSmall'])
    assert.isUndefined(firstCard.name)
    assert.isUndefined(firstCard.number)
  })

  test('getAllCards - should sort by set release date and card number', async ({ assert }) => {
    const result = await cardService.getAllCards({ page: 1, limit: 10 })

    const cardIds = result.map((card) => card.id)

    assert.equal(cardIds[0], 'base1-1')
    assert.equal(cardIds[1], 'base1-2')
    assert.equal(cardIds[2], 'base1-3')
  })

  test('getAllCards - should filter by name correctly', async ({ assert }) => {
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

    assert.isAtLeast(partialResult.length, 2)

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

  test('getCardDetailById - should return a card with all required fields', async ({ assert }) => {
    const card = await cardService.getCardDetailById('base1-3')
    assert.properties(card.$attributes, ['id', 'name', 'imageLarge', 'flavorText', 'number'])
  })

  test('getCardDetailById - should load related data correctly', async ({ assert }) => {
    const card = await cardService.getCardDetailById('base1-3')
    assert.property(card.$preloaded, 'set')
    assert.property(card.$preloaded, 'rarity')
    assert.property(card.$preloaded, 'artist')
    assert.property(card.$preloaded, 'subtypes')
    const set = card.$preloaded.set as Set
    const rarity = card.$preloaded.rarity as Rarity
    const artist = card.$preloaded.artist as Artist
    const subtypes = card.$preloaded.subtypes as Subtype[]
    assert.properties(set.$attributes, ['id', 'name', 'releaseDate', 'imageSymbol'])
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
    const card = await cardService.getCardDetailById('base1-3')
    assert.property(card.$attributes, 'id')
    assert.property(card.$attributes, 'name')
    assert.property(card.$attributes, 'imageLarge')
    assert.property(card.$attributes, 'flavorText')
    assert.property(card.$attributes, 'number')
    assert.notProperty(card.$attributes, 'imageSmall')
    assert.notProperty(card.$attributes, 'supertype')
    assert.notProperty(card.$attributes, 'hp')
    assert.notProperty(card.$attributes, 'convertedRetreatCost')
  })
})
