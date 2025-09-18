import { inject } from '@adonisjs/core'
import AdService from '#services/ad_service'
import PaymentIntentService from '#services/payment_intent_service'
import UserAddressService from '#services/user_address_service'
import CostUtils from '#utils/cost_utils'
import OrderService from '#services/order_service'

@inject()
export default class OrderProcessor {
  constructor(
    private adService: AdService,
    private paymentIntentService: PaymentIntentService,
    private userAddressService: UserAddressService,
    private orderService: OrderService
  ) {}

  /**
   * Process to create order.
   */
  public async createOrder(paymentItentId: string): Promise<void> {
    const paymentIntent = await this.paymentIntentService.getValidPaymentIntentById(paymentItentId)
    const ad = await this.adService.getAdById(paymentIntent.adId)
    const mainAddress = await this.userAddressService.getMainAddress(paymentIntent.fromId)
    const costReview = CostUtils.getCostsReview(ad.originalPrice)
    await this.orderService.createOrder(paymentIntent.id, costReview, mainAddress.addressId)
  }
}
