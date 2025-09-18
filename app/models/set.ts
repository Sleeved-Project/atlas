import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, computed } from '@adonisjs/lucid/orm'
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

  @column({ columnName: 'printed_total' })
  declare printedTotal: number

  @column()
  declare total: number

  @column({ columnName: 'ptcgo_code' })
  declare ptcgoCode: string | null

  @column.date({ columnName: 'release_date' })
  declare releaseDate: DateTime

  @column.dateTime({ columnName: 'updated_at', autoCreate: true })
  declare updatedAt: DateTime

  @column({ columnName: 'image_symbol' })
  declare imageSymbol: string

  @column({ columnName: 'image_logo' })
  declare imageLogo: string

  @column({ columnName: 'legality_id' })
  declare legalityId: number

  @belongsTo(() => Legality, {
    foreignKey: 'legalityId',
  })
  declare legality: BelongsTo<typeof Legality>

  @computed()
  public get nbOwned(): number {
    return this.$extras.nbOwned || 0
  }
}
