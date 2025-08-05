import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import UserAddress from './user_address.js'

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

  @column.dateTime({ columnName: 'created_at', autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ columnName: 'updated_at', autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime({ columnName: 'deleted_at', autoCreate: false })
  declare deletedAt: DateTime | null

  @hasMany(() => UserAddress)
  declare addresses: HasMany<typeof UserAddress>
}
