import Legality from '#models/legality'
import Factory from '@adonisjs/lucid/factories'

export const LegalityFactory = Factory.define(Legality, ({ faker }) => {
  return {
    standard: faker.helpers.arrayElement(['Legal', 'Banned', 'Not Legal', null]),
    expanded: faker.helpers.arrayElement(['Legal', 'Banned', 'Not Legal', null]),
    unlimited: faker.helpers.arrayElement(['Legal', 'Banned', 'Not Legal', null]),
  }
}).build()
