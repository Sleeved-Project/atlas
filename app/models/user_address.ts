import { v4 as uuidv4 } from 'uuid'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Address from './address.js'
import User from './user.js'

export default class UserAddress extends BaseModel {
  /**
   * The table associated with the model.
   */
  static table = 'User_Address'

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'address_id' })
  declare addressId: string

  @column({ columnName: 'user_id' })
  declare userId: string

  @column({ columnName: 'is_main' })
  declare isMain: boolean

  @belongsTo(() => Address, {
    foreignKey: 'addressId',
  })
  declare address: BelongsTo<typeof Address>

  @belongsTo(() => User, {
    foreignKey: 'userId',
  })
  declare user: BelongsTo<typeof User>

  @beforeCreate()
  static assignUuid(userAddress: UserAddress) {
    userAddress.id = uuidv4()
  }
}
