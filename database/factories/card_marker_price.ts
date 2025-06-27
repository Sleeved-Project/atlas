import CardMarketPrice from '#models/card_market_price'
import Factory from '@adonisjs/lucid/factories'
import { DateTime } from 'luxon'

export const CardMarketPriceFactory = Factory.define(CardMarketPrice, ({ faker }) => {
  return {
    url: `https://cardmarket.com/base1-1`,
    averageSellPrice:
      Math.random() > 0.1 ? faker.number.float({ min: 0.5, max: 100, fractionDigits: 2 }) : null,
    lowPrice:
      Math.random() > 0.1 ? faker.number.float({ min: 0.1, max: 50, fractionDigits: 2 }) : null,
    trendPrice:
      Math.random() > 0.1 ? faker.number.float({ min: 1, max: 150, fractionDigits: 2 }) : null,
    germanProLow:
      Math.random() > 0.3 ? faker.number.float({ min: 0.5, max: 80, fractionDigits: 2 }) : null,
    suggestedPrice:
      Math.random() > 0.2 ? faker.number.float({ min: 1, max: 200, fractionDigits: 2 }) : null,
    reverseHoloSell:
      Math.random() > 0.4 ? faker.number.float({ min: 1, max: 100, fractionDigits: 2 }) : null,
    reverseHoloLow:
      Math.random() > 0.4 ? faker.number.float({ min: 0.5, max: 80, fractionDigits: 2 }) : null,
    reverseHoloTrend:
      Math.random() > 0.4 ? faker.number.float({ min: 1, max: 150, fractionDigits: 2 }) : null,
    lowPriceExPlus:
      Math.random() > 0.3 ? faker.number.float({ min: 0.5, max: 60, fractionDigits: 2 }) : null,
    avg1: Math.random() > 0.2 ? faker.number.float({ min: 1, max: 150, fractionDigits: 2 }) : null,
    avg7: Math.random() > 0.2 ? faker.number.float({ min: 1, max: 150, fractionDigits: 2 }) : null,
    avg30: Math.random() > 0.2 ? faker.number.float({ min: 1, max: 150, fractionDigits: 2 }) : null,
    reverseHoloAvg1:
      Math.random() > 0.4 ? faker.number.float({ min: 1, max: 200, fractionDigits: 2 }) : null,
    reverseHoloAvg7:
      Math.random() > 0.4 ? faker.number.float({ min: 1, max: 200, fractionDigits: 2 }) : null,
    reverseHoloAvg30:
      Math.random() > 0.4 ? faker.number.float({ min: 1, max: 200, fractionDigits: 2 }) : null,
    updatedAt: DateTime.now(),
  }
}).build()
