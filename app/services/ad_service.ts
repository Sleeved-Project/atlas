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

  public async getAdById(id: string): Promise<Ad> {
    return await Ad.findOrFail(id)
  }

  public async updateAd(id: string, data: Partial<Ad>): Promise<Ad> {
    const ad = await Ad.findOrFail(id)
    ad.merge(data)
    await ad.save()

    return ad
  }
}
