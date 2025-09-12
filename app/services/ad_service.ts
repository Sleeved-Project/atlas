import Ad from '#models/ad'
import { AdsFilters } from '#types/ads_type'

export default class AdService {
  public async createAd(
    sellerId: string,
    finishId: number,
    conditionId: number,
    cardId: string,
    rectoImageUrl: string,
    versoImageUrl: string,
    originalPrice: number,
    certificateId: string | null
  ): Promise<Ad> {
    return await Ad.create({
      sellerId,
      originalPrice,
      rectoImageUrl,
      versoImageUrl,
      cardId,
      statusId: 1,
      conditionId,
      finishId,
      certificateId,
    })
  }

  public async listAds(filters: AdsFilters) {
    const { page = 1, limit = 20 } = filters
    const adsQuery = Ad.query()
      .preload('status')
      .preload('condition')
      .preload('finish')
      .preload('card')
      .preload('certificate')
      .preload('seller')
      .orderBy('createdAt', 'desc')

    const result = await adsQuery.paginate(page, limit)

    return {
      data: result.all().map((ad) => ({
        id: ad.id,
        originalPrice: ad.originalPrice,
        rectoImageUrl: ad.rectoImageUrl,
        versoImageUrl: ad.versoImageUrl,
        status: ad.status,
        condition: ad.condition,
        finish: ad.finish,
        card: ad.card,
        certificate: ad.certificate,
        seller: ad.seller,
        createdAt: ad.createdAt,
        updatedAt: ad.updatedAt,
      })),
      meta: result.getMeta(),
    }
  }

  public async searchAds(filters: { query: string; page?: number; limit?: number }) {
    const { query, page = 1, limit = 20 } = filters
    const adsQuery = Ad.query()
      .preload('status')
      .preload('condition')
      .preload('finish')
      .preload('card')
      .preload('certificate')
      .preload('seller')
      .whereHas('card', (cardQuery) => {
        cardQuery.where('name', 'like', `%${query}%`)
      })
      .orderBy('createdAt', 'desc')

    const result = await adsQuery.paginate(page, limit)

    return {
      data: result.all().map((ad) => ({
        id: ad.id,
        originalPrice: ad.originalPrice,
        rectoImageUrl: ad.rectoImageUrl,
        versoImageUrl: ad.versoImageUrl,
        status: ad.status,
        condition: ad.condition,
        finish: ad.finish,
        card: ad.card,
        certificate: ad.certificate,
        seller: ad.seller,
        createdAt: ad.createdAt,
        updatedAt: ad.updatedAt,
      })),
      meta: result.getMeta(),
    }
  }

  public async getStripePaymentRelevantColumnsAdById(id: string): Promise<Ad> {
    return await Ad.query().select('original_price').where('id', id).firstOrFail()
  }

  public async updateAd(id: string, data: Partial<Ad>): Promise<Ad> {
    const ad = await Ad.findOrFail(id)
    ad.merge(data)
    await ad.save()

    return ad
  }
}
