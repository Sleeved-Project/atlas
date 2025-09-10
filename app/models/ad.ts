import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Card from './card.js'
import AdStatus from './ad_status.js'
import CardCondition from './card_condition.js'
import CardFinish from './card_finish.js'
import User from './user.js'
import Certificate from './certificate.js'

export default class Ad extends BaseModel {
  /**
   * The table associated with the model.
   */
  static table = 'Ad'

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'original_Price' })
  declare originalPrice: number

  @column({ columnName: 'recto_image_url' })
  declare rectoImageUrl: string

  @column({ columnName: 'verso_image_url' })
  declare versoImageUrl: string

  @column.dateTime({ columnName: 'created_at', autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ columnName: 'updated_at', autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column({ columnName: 'card_id' })
  declare cardId: string

  @column({ columnName: 'status_id' })
  declare statusId: number

  @column({ columnName: 'condition_id' })
  declare conditionId: number

  @column({ columnName: 'finish_id' })
  declare finishId: number

  @column({ columnName: 'seller_id' })
  declare sellerId: string

  @column({ columnName: 'certificate_id' })
  declare certificateId: string | null

  @belongsTo(() => Card)
  declare card: BelongsTo<typeof Card>

  @belongsTo(() => AdStatus, {
    foreignKey: 'statusId',
  })
  declare status: BelongsTo<typeof AdStatus>

  @belongsTo(() => CardCondition, {
    foreignKey: 'conditionId',
  })
  declare condition: BelongsTo<typeof CardCondition>

  @belongsTo(() => CardFinish, {
    foreignKey: 'finishId',
  })
  declare finish: BelongsTo<typeof CardFinish>

  @belongsTo(() => User, {
    foreignKey: 'sellerId',
  })
  declare seller: BelongsTo<typeof User>

  @belongsTo(() => Certificate, {
    foreignKey: 'certificateId',
  })
  declare certificate: BelongsTo<typeof Certificate>

  @beforeCreate()
  static assignUuid(ad: Ad) {
    ad.id = uuidv4()
  }
}
