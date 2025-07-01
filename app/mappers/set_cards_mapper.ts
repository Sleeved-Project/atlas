import Card from '#models/card'
import { SetCardPriceTrending, SetStatistics } from '#types/set_type'

export default class SetCardsMapper {
  public static toSetStatistics(todayCards: Card[], yesterdayCards: Card[]): SetStatistics {
    const todayCardMarketPrice = this.getCardMarketTrendPrice(todayCards)
    const yesterdayCardMarketPrice = this.getCardMarketTrendPrice(yesterdayCards)

    const todayTcgPlayerPrice = this.getLowerTcgPlayerMarketPrice(todayCards)
    const yesterdayTcgPlayerPrice = this.getLowerTcgPlayerMarketPrice(yesterdayCards)

    return {
      totalCardsCount: todayCards.length,
      cardMarketPrice: todayCardMarketPrice.toFixed(2).toString(),
      tcgPlayerPrice: todayTcgPlayerPrice.toFixed(2).toString(),
      cardMarketTrending: this.getPriceTrend(todayCardMarketPrice, yesterdayCardMarketPrice),
      tcgPlayerTrending: this.getPriceTrend(todayTcgPlayerPrice, yesterdayTcgPlayerPrice),
    }
  }

  public static getPriceTrend(todayPrice: number, yesterdayPrice: number): SetCardPriceTrending {
    if (todayPrice > yesterdayPrice) {
      return SetCardPriceTrending.UP
    } else if (todayPrice < yesterdayPrice) {
      return SetCardPriceTrending.DOWN
    }
    return SetCardPriceTrending.EQUAL
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
