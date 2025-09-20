import Ad from '#models/ad'
import Address from '#models/address'
import User from '#models/user'
import { AdCheckoutDTO, ShippingLabelOutputDTO } from '#types/ads_type'
import CostUtils from '#utils/cost_utils'

export default class AdMapper {
  public static toListData(ad: Ad) {
    const adData = ad.toJSON()
    return {
      id: adData.id,
      originalPrice: adData.originalPrice,
      rectoImageUrl: adData.rectoImageUrl,
      versoImageUrl: adData.versoImageUrl,
      status: adData.status,
      condition: adData.condition,
      finish: adData.finish,
      card: adData.card,
      certificate: adData.certificate,
      seller: adData.seller,
      createdAt: adData.createdAt,
      updatedAt: adData.updatedAt,
    }
  }

  public static toAdCheckoutOuputDTO(ad: Ad): AdCheckoutDTO {
    const serviceCosts = CostUtils.calculateServiceCosts(ad.originalPrice)
    const totalCosts = CostUtils.calculateTotalCosts(ad.originalPrice)

    return {
      ad: {
        rectoImageUrl: ad.rectoImageUrl,
        originalPrice: Number(ad.originalPrice).toFixed(2),
        finish: { label: ad.finish.label },
        condition: { label: ad.condition.label },
        seller: {
          id: ad.seller.id,
          profilePictureUrl: ad.seller.profilePictureUrl,
          username: ad.seller.username,
        },
        card: {
          name: ad.card.name,
        },
        certificate: ad.certificate
          ? {
              grade: {
                label: ad.certificate.grade.label,
              },
              globalRating: Number(ad.certificate.globalRating).toFixed(1),
            }
          : null,
      },
      prices: {
        shippingCosts: CostUtils.SHIPPING_COSTS.toFixed(2),
        serviceCosts: serviceCosts.toFixed(2),
        totalCosts: totalCosts.toFixed(2),
      },
    }
  }

  public static toShippingLabelOutputDTO(
    buyer: User,
    delveryAddress: Address
  ): ShippingLabelOutputDTO {
    const fullname = buyer.lastname + ' ' + buyer.firstname
    return {
      buyer: {
        name: fullname.trim() === '' ? null : fullname.trim(),
        phoneNumber: buyer.phone ? buyer.phone : null,
      },
      deliveryAddress: {
        street: delveryAddress.road,
        zipcode: delveryAddress.zipcode,
        city: delveryAddress.city,
        country: delveryAddress.country,
      },
    }
  }
}
