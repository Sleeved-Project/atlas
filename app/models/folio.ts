import { v4 as uuidv4 } from 'uuid'
import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'

export default class Folio extends BaseModel {
  /**
   * The table associated with the model.
   */
  static table = 'Folio'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare image: string | null

  @column({ columnName: 'is_root' })
  declare isRoot: boolean

  @column({ columnName: 'user_id' })
  declare userId: string

  @beforeCreate()
  static assignUuid(folio: Folio) {
    folio.id = uuidv4()
  }
}
