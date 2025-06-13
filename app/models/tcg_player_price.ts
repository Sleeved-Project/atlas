import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import TcgPlayerReporting from '#models/tcg_player_reporting'

export default class TcgPlayerPrice extends BaseModel {
  /**
   * The table associated with the model.
   */
  static table = 'Tcg_Player_Price'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare type: string

  @column()
  declare low: number | null

  @column()
  declare mid: number | null

  @column()
  declare high: number | null

  @column()
  declare market: number | null

  @column({ columnName: 'direct_low' })
  declare directLow: number | null

  @column({ columnName: 'tcg_player_reporting_id', serializeAs: null })
  declare tcgPlayerReportingId: number

  @belongsTo(() => TcgPlayerReporting, {
    foreignKey: 'tcgPlayerReportingId',
  })
  declare tcgPlayerReporting: BelongsTo<typeof TcgPlayerReporting>
}
