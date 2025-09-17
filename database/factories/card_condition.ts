import CardCondition from '#models/card_condition'
import Factory from '@adonisjs/lucid/factories'

export const CardConditionFactory = Factory.define(CardCondition, ({ faker }) => {
  return {
    label: faker.lorem.words(2),
    percentPriceAlteration: faker.number.int({ min: -50, max: 25 }),
  }
}).build()
