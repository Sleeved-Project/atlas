import CardFinish from '#models/card_finish'
import Factory from '@adonisjs/lucid/factories'

export const CardFinishFactory = Factory.define(CardFinish, ({ faker }) => {
  return {
    label: faker.lorem.words(2),
  }
}).build()
