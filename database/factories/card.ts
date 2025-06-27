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

export const CardFactory = Factory.define(Card, ({ faker }) => {
  // This is a simplified example. In a real application, you would likely

  return {
    id: faker.string.uuid(),
    name: `Pikachu`,
    supertype: `Pokémon`,
    level: `10`,
    hp: `120`,
    evolvesFrom: null,
    evolvesTo: `Raichu`,
    convertedRetreatCost: 2,
    number: `1`,
    imageLarge: `https://images.pokemontcg.io/base1/1_hires.png`,
    imageSmall: `https://images.pokemontcg.io/base1/1.png`,
    flavorText: null,
    nationalPokedexNumbers: null,
    artistId: 1,
    rarityId: 1,
    setId: `base1`,
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
  .relation('cardFolios', () => CardFolioFactory)
  .build()
