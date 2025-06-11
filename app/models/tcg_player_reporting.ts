import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Card from '#models/card'
import TcgPlayerPrice from './tcg_player_price.js'

export default class TcgPlayerReporting extends BaseModel {
  /**
   * The table associated with the model.
   */
  static table = 'Tcg_Player_Reporting'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare url: string | null

  @column.date({ columnName: 'updated_at' })
  declare updatedAt: DateTime

  @column({ columnName: 'card_id', serializeAs: null })
  declare cardId: string

  @belongsTo(() => Card, {
    foreignKey: 'cardId',
  })
  declare card: BelongsTo<typeof Card>

  @hasMany(() => TcgPlayerPrice, {
    foreignKey: 'tcgPlayerReportingId',
  })
  declare tcgPlayerPrices: HasMany<typeof TcgPlayerPrice>
}
