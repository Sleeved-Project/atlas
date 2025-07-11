import Card from '#models/card'
import db from '@adonisjs/lucid/services/db'
import { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import { RelationQueryBuilderContract } from '@adonisjs/lucid/types/relations'

export default class PriceQueryUtils {
  /**
   * Build price preload query from relation query builder or model query builder.
   */
  static buildPricePreloadQuery(
    daysBefore: number,
    cardQuery:
      | RelationQueryBuilderContract<typeof Card, any>
      | ModelQueryBuilderContract<typeof Card, Card>
  ) {
    return cardQuery
      .preload('cardMarketPrices', (cardMarketPricesQuery) => {
        cardMarketPricesQuery
          .select('id', 'trendPrice', 'reverseHoloTrend', 'url')
          .where('updated_at', '>', db.raw('NOW() - INTERVAL ? DAY', daysBefore))
          .andWhere('updated_at', '<=', db.raw('NOW() - INTERVAL ? DAY', daysBefore - 1))
      })
      .preload('tcgPlayerReportings', (tcgPlayerReportings) => {
        tcgPlayerReportings
          .select('id', 'url')
          .where('updated_at', '>', db.raw('NOW() - INTERVAL ? DAY', daysBefore))
          .andWhere('updated_at', '<=', db.raw('NOW() - INTERVAL ? DAY', daysBefore - 1))
          .preload('tcgPlayerPrices', (tcgPlayerPricesQuery) => {
            tcgPlayerPricesQuery.select('id', 'type', 'market')
          })
      })
  }
}
