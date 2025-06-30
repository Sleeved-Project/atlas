import { v4 as uuidv4 } from 'uuid'
import { BaseModel, beforeCreate, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'

import CardFolio from './card_folio.js'
import { DateTime } from 'luxon'

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

  @column.dateTime({ columnName: 'created_at', autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ columnName: 'updated_at', autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column({ columnName: 'user_id' })
  declare userId: string

  @hasMany(() => CardFolio, {
    foreignKey: 'folioId',
  })
  declare cardFolios: HasMany<typeof CardFolio>

  @beforeCreate()
  static assignUuid(folio: Folio) {
    folio.id = uuidv4()
  }
}
