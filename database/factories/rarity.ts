import Rarity from '#models/rarity'
import Factory from '@adonisjs/lucid/factories'

export const RarityFactory = Factory.define(Rarity, ({ faker }) => {
  return {
    label: faker.lorem.word(10),
  }
}).build()
