import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { v4 as uuidv4 } from 'uuid'
import User from './user.js'

export default class UserAddress extends BaseModel {
  /**
   * The table associated with the model.
   */
  static table = 'User_Address'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare address: string

  @column()
  declare zipcode: string

  @column()
  declare city: string

  @column()
  declare country: string

  @column({ columnName: 'country_code' })
  declare countryCode: string

  @column({ columnName: 'is_default' })
  declare isDefault: boolean

  @column({ columnName: 'user_id' })
  declare userId: string

  @column.dateTime({ columnName: 'created_at', autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ columnName: 'updated_at', autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @beforeCreate()
  static assignUuid(userAddress: UserAddress) {
    userAddress.id = uuidv4()
  }
}
