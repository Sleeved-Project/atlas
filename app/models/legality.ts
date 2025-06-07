import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Card from '#models/card'

export default class Legality extends BaseModel {
  /**
   * The table associated with the model.
   */
  static table = 'Legalities'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare standard: string | null

  @column()
  declare expanded: string | null

  @column()
  declare unlimited: string | null

  @hasMany(() => Card)
  declare cards: HasMany<typeof Card>
}
