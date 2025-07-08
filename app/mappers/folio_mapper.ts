import Folio from '#models/folio'
import { FoliosDetailsDTO, FoliosInfosAndStatisticsList } from '#types/folio_type'
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

  public static toFolioWithStatistics(
    foliosWithTodayCardsPrices: Folio,
    foliosWithYesterdayCardsPrices: Folio
  ): FoliosDetailsDTO {
    const todayCardFolios = foliosWithTodayCardsPrices.cardFolios || []
    const yesterdayCardFolios = foliosWithYesterdayCardsPrices.cardFolios || []

    const totalCardsCount = todayCardFolios.reduce((acc, cardFolio) => {
      return acc + (cardFolio.occurrence || 0)
    }, 0)

    const todayCardMarketPrice = PriceUtils.getCardMarketTrendPrice(todayCardFolios)
    const yesterdayCardMarketPrice = PriceUtils.getCardMarketTrendPrice(yesterdayCardFolios)

    const todayTcgPlayerPrice = PriceUtils.getLowerTcgPlayerMarketPrice(todayCardFolios)
    const yesterdayTcgPlayerPrice = PriceUtils.getLowerTcgPlayerMarketPrice(yesterdayCardFolios)

    const folioDetailStatistics = {
      totalCardsCount,
      cardMarketPrice: todayCardMarketPrice.toFixed(2).toString(),
      tcgPlayerPrice: todayTcgPlayerPrice.toFixed(2).toString(),
      cardMarketTrending: PriceUtils.getPriceTrend(todayCardMarketPrice, yesterdayCardMarketPrice),
      tcgPlayerTrending: PriceUtils.getPriceTrend(todayTcgPlayerPrice, yesterdayTcgPlayerPrice),
    }

    return {
      id: foliosWithTodayCardsPrices.id,
      name: foliosWithTodayCardsPrices.name,
      image: foliosWithTodayCardsPrices.image,
      createdAt: foliosWithTodayCardsPrices.createdAt.toISO(),
      statistics: folioDetailStatistics,
    }
  }
}
