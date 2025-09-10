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
      .preload('card', (query) => {
        query.select('id', 'name', 'setName')
      })
      .preload('condition', (query) => {
        query.select('id', 'label')
      })
      .preload('finish', (query) => {
        query.select('id', 'label')
      })
      .preload('status', (query) => {
        query.select('id', 'label')
      })
      .preload('seller', (query) => {
        query.select('id', 'username', 'firstname', 'lastname')
      })
      .preload('certificate', (query) => {
        query.select('id', 'grade')
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
}
