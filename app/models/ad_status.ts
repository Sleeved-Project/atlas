import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class AdStatus extends BaseModel {
  /**
   * The table associated with the model.
   */
  static table = 'Ad_Status'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare label: string
}
