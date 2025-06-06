import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Card from '#models/card'

export default class Rarity extends BaseModel {
  /**
   * The table associated with the model.
   */
  static table = 'Rarity'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare label: string

  @hasMany(() => Card)
  declare cards: HasMany<typeof Card>
}
