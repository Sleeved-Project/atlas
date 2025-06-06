import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Card extends BaseModel {
  /**
   * The table associated with the model.
   */
  static table = 'Card'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare imageSmall: string
}
