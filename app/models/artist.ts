import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Card from '#models/card'

export default class Artist extends BaseModel {
  /**
   * The table associated with the model.
   */
  static table = 'Artist'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @hasMany(() => Card)
  declare cards: HasMany<typeof Card>
}
