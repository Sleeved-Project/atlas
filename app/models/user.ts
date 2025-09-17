import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Folio from './folio.js'

export default class User extends BaseModel {
  /**
   * The table associated with the model.
   */
  static table = 'User'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare firstname: string | null

  @column()
  declare lastname: string | null

  @column()
  declare username: string

  @column()
  declare phone: string | null

  @column()
  declare description: string | null

  @column({ columnName: 'stripe_id' })
  declare stripeId: string | null

  @column({ columnName: 'remaning_certificate_token' })
  declare remainingCertificateToken: number

  @column({ columnName: 'profile_picture_url' })
  declare profilePictureUrl: string | null

  @column({ columnName: 'customer_id' })
  declare customerId: string | null

  @column.dateTime({ columnName: 'created_at', autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ columnName: 'updated_at', autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime({ columnName: 'deleted_at', autoCreate: false })
  declare deletedAt: DateTime | null

  @hasMany(() => Folio)
  declare folios: HasMany<typeof Folio>
}
