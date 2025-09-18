import { v4 as uuidv4 } from 'uuid'
import { BaseModel, column, beforeCreate } from '@adonisjs/lucid/orm'

export default class Address extends BaseModel {
  /**
   * The table associated with the model.
   */
  static table = 'Address'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare road: string

  @column({ columnName: 'additional_info' })
  declare additionalInfo: string | null

  @column()
  declare zipcode: string

  @column()
  declare city: string

  @column()
  declare country: string

  @column()
  declare countrycode: string

  @beforeCreate()
  static assignUuid(address: Address) {
    address.id = uuidv4()
  }
}
