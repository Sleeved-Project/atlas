import Ad from '#models/ad'

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
}
