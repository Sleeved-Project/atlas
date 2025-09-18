import { v4 as uuidv4 } from 'uuid'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import PaymentIntent from './payment_intent.js'
import Address from './address.js'
import OrderStatus from './order_status.js'

export default class Order extends BaseModel {
  /**
   * The table associated with the model.
   */
  static table = 'Order'

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'total_costs' })
  declare totalCosts: number

  @column({ columnName: 'service_costs' })
  declare serviceCosts: number

  @column({ columnName: 'shipping_costs' })
  declare shippingCosts: number

  @column({ columnName: 'payment_intent_id' })
  declare paymentIntentId: string

  @column({ columnName: 'delivery_address_id' })
  declare deliveryAddressId: string

  @column({ columnName: 'order_address_id' })
  declare orderAddressId: string

  @column({ columnName: 'status_id' })
  declare statusId: number

  @column.dateTime({ columnName: 'created_at', autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ columnName: 'updated_at', autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => PaymentIntent, {
    foreignKey: 'paymentIntentId',
  })
  declare paymentIntent: BelongsTo<typeof PaymentIntent>

  @belongsTo(() => Address, {
    foreignKey: 'deliveryAddressId',
  })
  declare deliveryAddress: BelongsTo<typeof Address>

  @belongsTo(() => Address, {
    foreignKey: 'orderAddressId',
  })
  declare orderAddress: BelongsTo<typeof Address>

  @belongsTo(() => OrderStatus, {
    foreignKey: 'statusId',
  })
  declare status: BelongsTo<typeof OrderStatus>

  @beforeCreate()
  static assignUuid(order: Order) {
    order.id = uuidv4()
  }
}
