import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class PaymentIntent extends BaseModel {
  /**
   * The table associated with the model.
   */
  static table = 'Payment_Intent'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare fromId: string

  @column()
  declare toId: string

  @column()
  declare adId: string

  @column()
  declare status: string

  @column.dateTime({ columnName: 'created_at', autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ columnName: 'updated_at', autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
