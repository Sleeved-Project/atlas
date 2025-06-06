import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Legality from '#models/legality'

export default class Set extends BaseModel {
  /**
   * The table associated with the model.
   */
  static table = 'Set'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare series: string

  @column()
  declare printedTotal: number

  @column()
  declare total: number

  @column()
  declare ptcgoCode: string | null

  @column.date()
  declare releaseDate: DateTime

  @column.dateTime()
  declare updatedAt: DateTime

  @column()
  declare imageSymbol: string

  @column()
  declare imageLogo: string

  @column()
  declare legalityId: number

  @belongsTo(() => Legality)
  declare legality: BelongsTo<typeof Legality>
}
