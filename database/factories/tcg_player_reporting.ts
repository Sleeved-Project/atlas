import TcgPlayerReporting from '#models/tcg_player_reporting'
import Factory from '@adonisjs/lucid/factories'
import { DateTime } from 'luxon'
import { TcgPlayerPriceFactory } from './tcg_player_price.js'

export const TcgPlayerReportingFactory = Factory.define(TcgPlayerReporting, ({ faker }) => {
  return {
    url: faker.internet.url(),
    updatedAt: DateTime.now(),
  }
})
  .relation('tcgPlayerPrices', () => TcgPlayerPriceFactory)
  .build()
