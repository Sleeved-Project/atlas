import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class OrderStatus extends BaseModel {
  /**
   * The table associated with the model.
   */
  static table = 'Order_Status'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare label: string
}
