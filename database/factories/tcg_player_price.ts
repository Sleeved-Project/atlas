import TcgPlayerPrice from '#models/tcg_player_price'
import Factory from '@adonisjs/lucid/factories'
import { TcgPlayerReportingFactory } from './tcg_player_reporting.js'

export const TcgPlayerPriceFactory = Factory.define(TcgPlayerPrice, ({ faker }) => {
  return {
    type: faker.lorem.word(10),
    low: Math.random() > 0.1 ? faker.number.float({ min: 0.5, max: 50, fractionDigits: 2 }) : null,
    mid: Math.random() > 0.1 ? faker.number.float({ min: 1, max: 100, fractionDigits: 2 }) : null,
    high: Math.random() > 0.1 ? faker.number.float({ min: 2, max: 200, fractionDigits: 2 }) : null,
    market:
      Math.random() > 0.1 ? faker.number.float({ min: 1, max: 150, fractionDigits: 2 }) : null,
    directLow:
      Math.random() > 0.2 ? faker.number.float({ min: 0.5, max: 80, fractionDigits: 2 }) : null,
  }
})
  .relation('tcgPlayerReporting', () => TcgPlayerReportingFactory)
  .build()
