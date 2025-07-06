import Folio from '#models/folio'
import { FoliosInfosAndStatisticsList } from '#types/folio_type'
import PriceUtils from '#utils/price_utils'

export default class FolioMapper {
  public static toFoliosWithStatistics(
    foliosWithTodayCardsPrices: Folio[]
  ): FoliosInfosAndStatisticsList {
    const foliosWithStatistics: FoliosInfosAndStatisticsList = []

    foliosWithTodayCardsPrices.forEach((folio) => {
      const cardFolios = folio.cardFolios || []
      const totalCardsCount = cardFolios.reduce((acc, cardFolio) => {
        return acc + (cardFolio.occurrence || 0)
      }, 0)

      const todayCardMarketPrice = PriceUtils.getCardMarketTrendPrice(cardFolios)

      const todayTcgPlayerPrice = PriceUtils.getLowerTcgPlayerMarketPrice(cardFolios)

      foliosWithStatistics.push({
        id: folio.id,
        name: folio.name,
        image: folio.image,
        statistics: {
          totalCardsCount,
          cardMarketPrice: todayCardMarketPrice.toFixed(2).toString(),
          tcgPlayerPrice: todayTcgPlayerPrice.toFixed(2).toString(),
        },
      })
    })

    return foliosWithStatistics
  }
}
