import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import CardFinishService from '#services/card_finish_service'
import { CardFinishBasicFactory } from '#database/factories/card_finish'
import CardFinish from '#models/card_finish'

test.group('CardFinishservice', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  let cardFinishService: CardFinishService

  group.setup(() => {
    cardFinishService = new CardFinishService()
  })

  test('getAllCardFinishes - should return all card Finish ordered by id', async ({ assert }) => {
    await CardFinishBasicFactory.create()

    const result = await cardFinishService.getAllCardFinishes()

    assert.equal(result.length, 1)
    assert.equal(result[0].label, 'Holofoil')
    assert.instanceOf(result[0], CardFinish)
  })

  test('getAllCardFinishes - should return empty array when no rarities exist', async ({
    assert,
  }) => {
    const result = await cardFinishService.getAllCardFinishes()

    assert.equal(result.length, 0)
    assert.isArray(result)
  })

  test('getAllCardFinishes - should return CardFinish model instances', async ({ assert }) => {
    await CardFinishBasicFactory.create()

    const result = await cardFinishService.getAllCardFinishes()

    assert.equal(result.length, 1)
    assert.instanceOf(result[0], CardFinish)
    assert.isTrue(typeof result[0].label === 'string')
  })

  test('getFinishById - should return a card finish by id', async ({ assert }) => {
    const cardFinish = await CardFinishBasicFactory.create()

    const result = await cardFinishService.getFinishById(cardFinish.id)

    assert.equal(result.id, cardFinish.id)
    assert.equal(result.label, cardFinish.label)
    assert.instanceOf(result, CardFinish)
  })

  test('getFinishById - should throw error when finish does not exist', async ({ assert }) => {
    const nonExistentId = 999

    await assert.rejects(
      async () => await cardFinishService.getFinishById(nonExistentId),
      'Row not found'
    )
  })
})
