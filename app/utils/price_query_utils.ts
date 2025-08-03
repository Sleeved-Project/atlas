import Card from '#models/card'
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
          .select('id', 'trendPrice', 'reverseHoloTrend', 'url', 'updated_at')
          .whereRaw(
            `
            DATE(updated_at) = (
              SELECT DATE_SUB(DATE(MAX(updated_at)), INTERVAL ? DAY) 
              FROM Card_Market_Price cmp2 
              WHERE cmp2.card_id = Card_Market_Price.card_id
            )
          `,
            [daysBefore]
          )
      })
      .preload('tcgPlayerReportings', (tcgPlayerReportings) => {
        tcgPlayerReportings
          .select('id', 'url', 'updated_at')
          .whereRaw(
            `
            DATE(updated_at) = (
              SELECT DATE_SUB(DATE(MAX(updated_at)), INTERVAL ? DAY) 
              FROM Tcg_Player_Reporting tpr2 
              WHERE tpr2.card_id = Tcg_Player_Reporting.card_id
            )
          `,
            [daysBefore]
          )
          .preload('tcgPlayerPrices', (tcgPlayerPricesQuery) => {
            tcgPlayerPricesQuery.select('id', 'type', 'market')
          })
      })
  }
}
