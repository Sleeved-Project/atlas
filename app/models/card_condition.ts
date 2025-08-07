import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class CardCondition extends BaseModel {
  /**
   * The table associated with the model.
   */
  static table = 'Card_Condition'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare label: string

  @column()
  declare code: string
}
