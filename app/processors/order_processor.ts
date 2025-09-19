import { inject } from '@adonisjs/core'
import AdService from '#services/ad_service'
import PaymentIntentService from '#services/payment_intent_service'
import UserAddressService from '#services/user_address_service'
import CostUtils from '#utils/cost_utils'
import OrderService from '#services/order_service'
import { PaginatedResponse } from '#types/paginate_dto_type'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import Order from '#models/order'

export interface OrderListOuputDTO {
  id: string
  seller: {
    username: string
  }
  condition: {
    id: number
    label: string
  }
  finish: {
    id: number
    label: string
  }
  card: {
    name: string
    rectoImageUrl: string
  }
  originalPrice: string
  status: {
    id: number
    label: string
  }
  createdAt: string
}

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

  /**
   * Process paginated orders to transform them into DTO.
   */
  public async processOrdersList(
    paginatedOrders: ModelPaginatorContract<Order>
  ): Promise<PaginatedResponse<OrderListOuputDTO>> {
    const data: OrderListOuputDTO[] = paginatedOrders.all().map((order) => ({
      id: order.id,
      seller: {
        username: order.paymentIntent.to.username,
      },
      condition: {
        id: order.paymentIntent.ad.condition.id,
        label: order.paymentIntent.ad.condition.label,
      },
      finish: {
        id: order.paymentIntent.ad.finish.id,
        label: order.paymentIntent.ad.finish.label,
      },
      card: {
        name: order.paymentIntent.ad.card.name,
        rectoImageUrl: order.paymentIntent.ad.rectoImageUrl,
      },
      originalPrice: Number(order.paymentIntent.ad.originalPrice).toFixed(2),
      status: {
        id: order.status.id,
        label: order.status.label,
      },
      createdAt: order.createdAt.toISO() ?? '',
    }))

    return {
      meta: paginatedOrders.getMeta(),
      data,
    }
  }
}
