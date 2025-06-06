import { test } from '@japa/runner'
import CardService from '#services/card_service'
import testUtils from '@adonisjs/core/services/test_utils'

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
})
