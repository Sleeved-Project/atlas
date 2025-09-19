import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Ad from './ad.js'

export default class PaymentIntent extends BaseModel {
  /**
   * The table associated with the model.
   */
  static table = 'Payment_Intent'

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'from_id', serializeAs: null })
  declare fromId: string

  @column({ columnName: 'to_id', serializeAs: null })
  declare toId: string

  @column({ columnName: 'ad_id', serializeAs: null })
  declare adId: string

  @column()
  declare status: string

  @column.dateTime({ columnName: 'created_at', autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ columnName: 'updated_at', autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, {
    localKey: 'id',
    foreignKey: 'fromId',
  })
  declare from: BelongsTo<typeof User>

  @belongsTo(() => User, {
    localKey: 'id',
    foreignKey: 'toId',
  })
  declare to: BelongsTo<typeof User>

  @belongsTo(() => Ad, {
    localKey: 'id',
    foreignKey: 'adId',
  })
  declare ad: BelongsTo<typeof Ad>
}
