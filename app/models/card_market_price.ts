import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Card from '#models/card'

export default class CardMarketPrice extends BaseModel {
  /**
   * The table associated with the model.
   */
  static table = 'Card_Market_Price'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare url: string | null

  @column({ columnName: 'average_sell_price' })
  declare averageSellPrice: number | null

  @column({ columnName: 'low_price' })
  declare lowPrice: number | null

  @column({ columnName: 'trend_price' })
  declare trendPrice: number | null

  @column({ columnName: 'german_pro_low' })
  declare germanProLow: number | null

  @column({ columnName: 'suggested_price' })
  declare suggestedPrice: number | null

  @column({ columnName: 'reverse_holo_sell' })
  declare reverseHoloSell: number | null

  @column({ columnName: 'reverse_holo_low' })
  declare reverseHoloLow: number | null

  @column({ columnName: 'reverse_holo_trend' })
  declare reverseHoloTrend: number | null

  @column({ columnName: 'low_price_ex_plus' })
  declare lowPriceExPlus: number | null

  @column({ columnName: 'avg_1' })
  declare avg1: number | null

  @column({ columnName: 'avg_7' })
  declare avg7: number | null

  @column({ columnName: 'avg_30' })
  declare avg30: number | null

  @column({ columnName: 'reverse_holo_avg_1' })
  declare reverseHoloAvg1: number | null

  @column({ columnName: 'reverse_holo_avg_7' })
  declare reverseHoloAvg7: number | null

  @column({ columnName: 'reverse_holo_avg_30' })
  declare reverseHoloAvg30: number | null

  @column({ columnName: 'card_id', serializeAs: null })
  declare cardId: string

  @column.date({ columnName: 'updated_at' })
  declare updatedAt: DateTime

  @belongsTo(() => Card, {
    foreignKey: 'cardId',
  })
  declare card: BelongsTo<typeof Card>
}
