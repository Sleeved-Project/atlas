import CardCondition from '#models/card_condition'
import Factory from '@adonisjs/lucid/factories'

export const CardConditionBasicFactory = Factory.define(CardCondition, () => {
  return {
    id: 1,
    label: `Good Condition`,
    percentPriceAlteration: 0,
  }
}).build()

export const CardConditionFactory = Factory.define(CardCondition, ({ faker }) => {
  return {
    id: faker.number.int({ min: 1, max: 1000 }),
    label: faker.string.alpha({ length: 10 }),
    percentPriceAlteration: faker.number.float({ min: -50, max: 50 }),
  }
}).build()
