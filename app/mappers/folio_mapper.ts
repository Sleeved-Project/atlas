import Folio from '#models/folio'
import {
  ChildFoliosInfosAndStatisticsListOuputDTO,
  FoliosDetailsOutputDTO,
} from '#types/folio_type'
import PriceUtils from '#utils/price_utils'

export default class FolioMapper {
  public static toChildFoliosInfosAndStatisticsListOuputDTO(
    foliosWithTodayCardsPrices: Folio[]
  ): ChildFoliosInfosAndStatisticsListOuputDTO {
    const foliosWithStatistics: ChildFoliosInfosAndStatisticsListOuputDTO = []

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

  public static toFoliosDetailsOutputDTO(
    foliosWithTodayCardsPrices: Folio,
    foliosWithYesterdayCardsPrices: Folio
  ): FoliosDetailsOutputDTO {
    const lastCardFolios = foliosWithTodayCardsPrices.cardFolios || []
    const dayBeforeLastCardFolios = foliosWithYesterdayCardsPrices.cardFolios || []

    const totalCardsCount = lastCardFolios.reduce((acc, cardFolio) => {
      return acc + (cardFolio.occurrence || 0)
    }, 0)

    const todayCardMarketPrice = PriceUtils.getCardMarketTrendPrice(lastCardFolios)
    const yesterdayCardMarketPrice = PriceUtils.getCardMarketTrendPrice(dayBeforeLastCardFolios)

    const todayTcgPlayerPrice = PriceUtils.getLowerTcgPlayerMarketPrice(lastCardFolios)
    const yesterdayTcgPlayerPrice = PriceUtils.getLowerTcgPlayerMarketPrice(dayBeforeLastCardFolios)

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
