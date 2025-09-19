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
    console.log(paymentIntent)
    const ad = await this.adService.getAdById(paymentIntent.adId)
    console.log(ad)
    const mainAddress = await this.userAddressService.getMainAddress(paymentIntent.fromId)
    console.log(mainAddress)
    const costReview = CostUtils.getCostsReview(ad.originalPrice)
    console.log(costReview)
    await this.orderService.createOrder(paymentIntent.id, costReview, mainAddress.addressId)
  }
}
