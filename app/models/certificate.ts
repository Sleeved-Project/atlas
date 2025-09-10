import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Card from './card.js'
import Grade from './grade.js'

export default class Certificate extends BaseModel {
  /**
   * The table associated with the model.
   */
  static table = 'Certificate'

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'global_rating' })
  declare globalRating: number

  @column({ columnName: 'centering_rating' })
  declare centeringRating: number

  @column({ columnName: 'corner_rating' })
  declare cornerRating: number

  @column({ columnName: 'edge_rating' })
  declare edgeRating: number

  @column({ columnName: 'surface_rating' })
  declare surfaceRating: number

  @column.dateTime({ columnName: 'certified_at', autoCreate: true })
  declare certifiedAt: DateTime

  @column({ columnName: 'card_id', serializeAs: null })
  declare cardId: string

  @column({ columnName: 'certified_by_id', serializeAs: null })
  declare certifiedById: string

  @column({ columnName: 'grade_id', serializeAs: null })
  declare gradeId: string

  @belongsTo(() => Card)
  declare card: BelongsTo<typeof Card>

  @belongsTo(() => User)
  declare certifiedBy: BelongsTo<typeof User>

  @belongsTo(() => Grade)
  declare grade: BelongsTo<typeof Grade>

  @beforeCreate()
  static assignUuid(certificate: Certificate) {
    certificate.id = uuidv4()
  }
}
