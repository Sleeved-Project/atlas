import CardFinish from '#models/card_finish'
import Factory from '@adonisjs/lucid/factories'

export const CardFinishBasicFactory = Factory.define(CardFinish, () => {
  return {
    id: 1,
    label: `Holofoil`,
  }
}).build()

export const CardFinishFactory = Factory.define(CardFinish, ({ faker }) => {
  return {
    id: faker.number.int({ min: 1, max: 1000 }),
    label: faker.string.alpha({ length: 10 }),
  }
}).build()
