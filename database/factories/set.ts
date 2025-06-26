import Set from '#models/set'
import Factory from '@adonisjs/lucid/factories'
import { DateTime } from 'luxon'
import { LegalityFactory } from './legality.js'

export const SetFactory = Factory.define(Set, () => {
  return {
    id: `base1`,
    name: `Base Set`,
    series: `Base`,
    printedTotal: 120,
    total: 120,
    ptcgoCode: `BASE`,
    releaseDate: DateTime.fromJSDate(new Date('1996-01-09')),
    updatedAt: DateTime.now(),
    imageSymbol: `https://images.pokemontcg.io/symbols/base1-1.png`,
    imageLogo: `https://images.pokemontcg.io/logos/base1-1.png`,
    legalityId: 1,
  }
})
  .relation('legality', () => LegalityFactory)
  .build()
