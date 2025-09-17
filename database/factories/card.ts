import Card from '#models/card'
import Factory from '@adonisjs/lucid/factories'
import { ArtistFactory } from './artist.js'
import { RarityFactory } from './rarity.js'
import { LegalityFactory } from './legality.js'
import { SetFactory } from './set.js'
import { SubtypeFactory } from './subtype.js'
import { CardMarketPriceFactory } from './card_marker_price.js'
import { TcgPlayerReportingFactory } from './tcg_player_reporting.js'
import { CardFolioFactory } from './card_folio.js'
import { TypeFactory } from './type.js'

export const CardFactory = Factory.define(Card, ({ faker }) => {
  return {
    id: faker.string.uuid(),
    name: faker.lorem.words(10),
    supertype: faker.lorem.words(10),
    level: faker.number.int({ min: 1, max: 100 }).toString(),
    hp: faker.number.int({ min: 10, max: 300 }).toString(),
    evolvesFrom: null,
    evolvesTo: faker.lorem.words(10),
    convertedRetreatCost: faker.number.int({ min: 0, max: 4 }),
    number: faker.number.int({ min: 10, max: 300 }).toString(),
    imageLarge: faker.image.urlPicsumPhotos(),
    imageSmall: faker.image.urlPicsumPhotos(),
    flavorText: null,
    nationalPokedexNumbers: null,
  }
})
  .relation('artist', () => ArtistFactory)
  .relation('rarity', () => RarityFactory)
  .relation('legality', () => LegalityFactory)
  .relation('set', () => SetFactory)
  .relation('subtypes', () => SubtypeFactory)
  .relation('types', () => TypeFactory)
  .relation('cardMarketPrices', () => CardMarketPriceFactory)
  .relation('tcgPlayerReportings', () => TcgPlayerReportingFactory)
  .relation('cardFolios', () => CardFolioFactory)
  .build()
