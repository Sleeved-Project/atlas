import Card from '#models/card'
import Factory from '@adonisjs/lucid/factories'
import { ArtistFactory } from './artist.js'
import { RarityFactory } from './rarity.js'
import { LegalityFactory } from './legality.js'
import { SetFactory } from './set.js'
import { SubtypeFactory } from './subtype.js'
import { CardMarketPriceFactory } from './card_marker_price.js'
import { TcgPlayerReportingFactory } from './tcg_player_reporting.js'

export const CardFactory = Factory.define(Card, ({ faker }) => {
  const setPrefix = faker.helpers.arrayElement(['base'])
  const setNumber = faker.number.int({ min: 1, max: 1 })
  const cardNumber = faker.number.int({ min: 1, max: 200 })
  const cardId = `${setPrefix}${setNumber}-${cardNumber}`

  return {
    id: cardId,
    name: faker.lorem.words({ min: 1, max: 3 }),
    supertype: faker.helpers.arrayElement(['Pokémon', 'Trainer', 'Energy']),
    level: faker.number.int({ min: 1, max: 100 }).toString(),
    hp: faker.number.int({ min: 30, max: 340 }).toString(),
    evolvesFrom: Math.random() > 0.7 ? faker.lorem.word() : null,
    evolvesTo: Math.random() > 0.7 ? faker.lorem.word() : null,
    convertedRetreatCost: faker.number.int({ min: 0, max: 5 }),
    number: cardNumber.toString(),
    imageLarge: `https://images.pokemontcg.io/${setPrefix}${setNumber}/${cardNumber}_hires.png`,
    imageSmall: `https://images.pokemontcg.io/${setPrefix}${setNumber}/${cardNumber}.png`,
    flavorText: Math.random() > 0.3 ? faker.lorem.sentence() : null,
    nationalPokedexNumbers:
      Math.random() > 0.5 ? faker.number.int({ min: 1, max: 1000 }).toString() : null,
    artistId: 1,
    rarityId: 1,
    setId: `${setPrefix}${setNumber}`,
    legalityId: 1,
  }
})
  .relation('artist', () => ArtistFactory)
  .relation('rarity', () => RarityFactory)
  .relation('legality', () => LegalityFactory)
  .relation('set', () => SetFactory)
  .relation('subtypes', () => SubtypeFactory)
  .relation('cardMarketPrices', () => CardMarketPriceFactory)
  .relation('tcgPlayerReportings', () => TcgPlayerReportingFactory)
  .build()
