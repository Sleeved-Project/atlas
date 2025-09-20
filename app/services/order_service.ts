import Order from '#models/order'
import { CostsReview } from '#types/cost_type'
import { OrderStatusEnum } from '#types/order_type'
import { getOrdersFiltersValidator } from '#validators/order_validator'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import { Infer } from '@vinejs/vine/types'

export default class OrderService {
  public async createOrder(
    paymentIntentId: string,
    costReview: CostsReview,
    addressId: string
  ): Promise<Order> {
    return await Order.create({
      totalCosts: costReview.totalCosts,
      serviceCosts: costReview.serviceCosts,
      shippingCosts: costReview.shippingCosts,
      paymentIntentId,
      orderAddressId: addressId,
      deliveryAddressId: addressId,
      statusId: OrderStatusEnum.PENDING_DELIVERY,
    })
  }

  public async updateOrderStatusByPaymentIntentId(
    paymentIntentId: string,
    statusId: OrderStatusEnum
  ): Promise<Order> {
    const order = await Order.query().where('payment_intent_id', paymentIntentId).firstOrFail()
    order.statusId = statusId
    await order.save()
    return order
  }

  public async getPaginatedOrdersByUserId(
    userId: string,
    filters: Infer<typeof getOrdersFiltersValidator>
  ): Promise<ModelPaginatorContract<Order>> {
    return Order.query()
      .select('id', 'created_at', 'status_id', 'payment_intent_id')
      .whereHas('paymentIntent', (query) => {
        query.where('from_id', userId)
      })
      .preload('paymentIntent', (paymentIntentQuery) =>
        paymentIntentQuery
          .select('id', 'ad_id', 'to_id')
          .preload('ad', (adQuery) =>
            adQuery
              .select(
                'id',
                'original_price',
                'recto_image_url',
                'conditionId',
                'finishId',
                'cardId'
              )
              .preload('card', (cardQuery) => cardQuery.select('id', 'name'))
              .preload('condition', (conditionQuery) => conditionQuery.select('id', 'label'))
              .preload('finish', (finishQuery) => finishQuery.select('id', 'label'))
          )
          .preload('to', (userQuery) => userQuery.select('id', 'username'))
      )
      .preload('status', (statusQuery) => statusQuery.select('id', 'label'))
      .paginate(filters.page, filters.limit)
  }

  public async getOrdersByIdAndUserId(userId: string, orderId: string): Promise<Order> {
    return Order.query()
      .select('id', 'created_at', 'updated_at', 'status_id', 'payment_intent_id', 'total_costs')
      .where('id', orderId)
      .whereHas('paymentIntent', (query) => {
        query.where('from_id', userId)
      })
      .preload('paymentIntent', (paymentIntentQuery) =>
        paymentIntentQuery
          .select('id', 'ad_id', 'to_id')
          .preload('ad', (adQuery) =>
            adQuery
              .select(
                'id',
                'original_price',
                'recto_image_url',
                'conditionId',
                'finishId',
                'cardId'
              )
              .preload('card', (cardQuery) => cardQuery.select('id', 'name'))
              .preload('condition', (conditionQuery) => conditionQuery.select('id', 'label'))
              .preload('finish', (finishQuery) => finishQuery.select('id', 'label'))
          )
          .preload('to', (userQuery) => userQuery.select('id', 'username'))
      )
      .preload('status', (statusQuery) => statusQuery.select('id', 'label'))
      .firstOrFail()
  }
}
