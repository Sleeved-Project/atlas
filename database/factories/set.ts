import Set from '#models/set'
import Factory from '@adonisjs/lucid/factories'
import { DateTime } from 'luxon'
import { LegalityFactory } from './legality.js'

export const SetFactory = Factory.define(Set, ({ faker }) => {
  const setPrefix = faker.helpers.arrayElement(['base'])
  const setNumber = faker.number.int({ min: 1, max: 1 })

  return {
    id: `${setPrefix}${setNumber}`,
    name: `${faker.commerce.productAdjective()} ${faker.word.noun()}`,
    series: faker.helpers.arrayElement([
      'Base',
      'XY',
      'Sun & Moon',
      'Sword & Shield',
      'Scarlet & Violet',
    ]),
    printedTotal: faker.number.int({ min: 100, max: 250 }),
    total: faker.number.int({ min: 100, max: 300 }),
    ptcgoCode: Math.random() > 0.2 ? faker.string.alphanumeric(3).toUpperCase() : null,
    releaseDate: DateTime.fromJSDate(faker.date.past()),
    updatedAt: DateTime.now(),
    imageSymbol: `https://images.pokemontcg.io/symbols/${setPrefix}${setNumber}.png`,
    imageLogo: `https://images.pokemontcg.io/logos/${setPrefix}${setNumber}.png`,
  }
})
  .relation('legality', () => LegalityFactory)
  .build()
