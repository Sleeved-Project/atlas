import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Type extends BaseModel {
  /**
   * The table associated with the model.
   */
  static table = 'Type'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare label: string
}
