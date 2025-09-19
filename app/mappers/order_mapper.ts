import Order from '#models/order'
import UserAddress from '#models/user_address'
import { OrderDetailsOutputDTO } from '#types/order_type'

export default class OrderMapper {
  public static toOrderDetailsOutputDTO(
    order: Order,
    userAddress: UserAddress
  ): OrderDetailsOutputDTO {
    return {
      ad: {
        rectoImageUrl: order.paymentIntent.ad.rectoImageUrl,
        originalPrice: Number(order.paymentIntent.ad.originalPrice).toFixed(2),
        finish: {
          label: order.paymentIntent.ad.finish.label,
        },
        condition: {
          label: order.paymentIntent.ad.condition.label,
        },
        seller: {
          id: order.paymentIntent.to.id,
          username: order.paymentIntent.to.username,
          profilePictureUrl: order.paymentIntent.to.profilePictureUrl || '',
        },
        card: {
          name: order.paymentIntent.ad.card.name,
        },
        certificate: order.paymentIntent.ad.certificate
          ? {
              grade: { label: order.paymentIntent.ad.certificate.grade.label },
              globalRating: Number(order.paymentIntent.ad.certificate.globalRating).toFixed(1),
            }
          : null,
      },
      addresses: {
        delivery: {
          id: userAddress.address.id,
          road: userAddress.address.road,
          additionalInfo: userAddress.address.additionalInfo,
          zipcode: userAddress.address.zipcode,
          city: userAddress.address.city,
          country: userAddress.address.country,
          countrycode: userAddress.address.countrycode,
        },
        billing: {
          id: userAddress.address.id,
          road: userAddress.address.road,
          additionalInfo: userAddress.address.additionalInfo,
          zipcode: userAddress.address.zipcode,
          city: userAddress.address.city,
          country: userAddress.address.country,
          countrycode: userAddress.address.countrycode,
        },
      },
      prices: {
        totalCosts: Number(order.totalCosts).toFixed(2),
      },
      status: {
        label: order.status.label,
      },
      updatedAt: order.updatedAt.toISO() ?? '',
      createdAt: order.updatedAt.toISO() ?? '',
    }
  }
}
