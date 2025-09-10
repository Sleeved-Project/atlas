import Ad from '#models/ad'

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
}
