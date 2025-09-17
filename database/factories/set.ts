import Set from '#models/set'
import Factory from '@adonisjs/lucid/factories'
import { DateTime } from 'luxon'
import { LegalityFactory } from './legality.js'

export const SetFactory = Factory.define(Set, ({ faker }) => {
  return {
    id: faker.string.uuid(),
    name: faker.lorem.words(10),
    series: faker.lorem.words(10),
    printedTotal: faker.number.int({ min: 100, max: 200 }),
    total: faker.number.int({ min: 100, max: 200 }),
    ptcgoCode: faker.lorem.words(1),
    releaseDate: DateTime.fromJSDate(faker.date.past({ years: 30, refDate: new Date() })),
    updatedAt: DateTime.now(),
    imageSymbol: faker.image.urlPicsumPhotos(),
    imageLogo: faker.image.urlPicsumPhotos(),
  }
})
  .relation('legality', () => LegalityFactory)
  .build()
