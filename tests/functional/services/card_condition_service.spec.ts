import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import CardConditionService from '#services/card_condition_service'
import { CardConditionBasicFactory } from '#database/factories/card_condition'
import CardCondition from '#models/card_condition'

test.group('CardConditionService', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  let cardConditionService: CardConditionService

  group.setup(() => {
    cardConditionService = new CardConditionService()
  })

  test('getAllCardConditions - should return all card condition ordered by id', async ({
    assert,
  }) => {
    await CardConditionBasicFactory.create()

    const result = await cardConditionService.getAllCardConditions()

    assert.equal(result.length, 1)
    assert.equal(result[0].label, 'Great Mint')
    assert.equal(result[0].code, 'GM')
    assert.instanceOf(result[0], CardCondition)
  })

  test('getAllCardConditions - should return empty array when no rarities exist', async ({
    assert,
  }) => {
    const result = await cardConditionService.getAllCardConditions()

    assert.equal(result.length, 0)
    assert.isArray(result)
  })

  test('getAllCardConditions - should return CardCondition model instances', async ({ assert }) => {
    await CardConditionBasicFactory.create()

    const result = await cardConditionService.getAllCardConditions()

    assert.equal(result.length, 1)
    assert.instanceOf(result[0], CardCondition)
    assert.isTrue(typeof result[0].label === 'string')
    assert.isTrue(typeof result[0].code === 'string')
  })
})
