import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class CardFinish extends BaseModel {
  /**
   * The table associated with the model.
   */
  static table = 'Card_Finish'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare label: string
}
