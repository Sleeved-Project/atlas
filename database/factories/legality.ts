import Legality from '#models/legality'
import Factory from '@adonisjs/lucid/factories'

export const LegalityFactory = Factory.define(Legality, ({ faker }) => {
  return {
    standard: faker.lorem.words(10),
    expanded: faker.lorem.words(10),
    unlimited: faker.lorem.words(10),
  }
}).build()
