import Order from '#models/order'
import { CostsReview } from '#types/cost_type'
import { OrderStatusEnum } from '#types/order_type'

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
}
