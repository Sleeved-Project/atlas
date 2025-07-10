import Card from '#models/card'
import { BasicSet, SetStatisticsOutputDTO } from '#types/set_type'
import PriceUtils from '#utils/price_utils'

export default class SetCardsMapper {
  public static toSetStatisticsOutput(
    basicSet: BasicSet,
    todayCards: Card[],
    yesterdayCards: Card[]
  ): SetStatisticsOutputDTO {
    const todayCardMarketPrice = this.getCardMarketTrendPrice(todayCards)
    const yesterdayCardMarketPrice = this.getCardMarketTrendPrice(yesterdayCards)

    const todayTcgPlayerPrice = this.getLowerTcgPlayerMarketPrice(todayCards)
    const yesterdayTcgPlayerPrice = this.getLowerTcgPlayerMarketPrice(yesterdayCards)

    return {
      ...basicSet,
      statistics: {
        cardMarketPrice: todayCardMarketPrice.toFixed(2).toString(),
        tcgPlayerPrice: todayTcgPlayerPrice.toFixed(2).toString(),
        cardMarketTrending: PriceUtils.getPriceTrend(
          todayCardMarketPrice,
          yesterdayCardMarketPrice
        ),
        tcgPlayerTrending: PriceUtils.getPriceTrend(todayTcgPlayerPrice, yesterdayTcgPlayerPrice),
      },
    }
  }

  public static getLowerTcgPlayerMarketPrice(cards: Card[]): number {
    return cards.reduce((acc, card) => {
      const firstTcgPlayerReporting = card.tcgPlayerReportings?.[0]
      if (firstTcgPlayerReporting?.tcgPlayerPrices?.length > 0) {
        const lowerTcgPlayerMarketPrice = firstTcgPlayerReporting.tcgPlayerPrices.sort(
          (a, b) => (a.market || 0) - (b.market || 0)
        )[0].market
        const marketPrice = +(lowerTcgPlayerMarketPrice || 0)
        return acc + marketPrice
      }
      return acc
    }, 0)
  }

  public static getCardMarketTrendPrice(cards: Card[]): number {
    return cards.reduce((acc, card) => {
      const firstCardMarketPrice = card.cardMarketPrices?.[0]
      if (firstCardMarketPrice) {
        const trendPrice = +(firstCardMarketPrice.trendPrice || 0)
        return acc + trendPrice
      }
      return acc
    }, 0)
  }
}
