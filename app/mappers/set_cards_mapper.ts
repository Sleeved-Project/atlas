import Card from '#models/card'
import { SetCardPriceTrending, SetStatistics } from '#types/set_type'

export default class SetCardsMapper {
  public static toSetStatistics(todayCards: Card[], yesterdayCards: Card[]): SetStatistics {
    const todayPrice = this.getLowerTcgPlayerMarketPrice(todayCards)
    const yesterdayPrice = this.getLowerTcgPlayerMarketPrice(yesterdayCards)

    const trending = this.getPriceTrend(todayPrice, yesterdayPrice)

    return {
      totalCardsCount: todayCards.length,
      cardMarketPrice: todayPrice.toFixed(2),
      tcgPlayerPrice: todayPrice.toFixed(2),
      cardMarketTrending: trending,
      tcgPlayerTrending: trending,
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
    let total = 0
    for (const card of cards) {
      const reporting = card.tcgPlayerReportings?.[0]
      if (reporting && reporting.tcgPlayerPrices && reporting.tcgPlayerPrices.length > 0) {
        const lowest = Math.min(
          ...reporting.tcgPlayerPrices
            .map((price) => price.market ?? 0)
            .filter((market) => market !== null)
        )
        total += lowest
      }
    }
    return total
  }

  public static getCardMarketTrendPrice(cards: Card[]): number {
    let total = 0
    for (const card of cards) {
      const price = card.cardMarketPrices?.[0]
      if (price) {
        const trend = price.trendPrice ?? 0
        const reverseHolo = price.reverseHoloTrend ?? 0
        total += Math.max(trend, reverseHolo)
      }
    }
    return total
  }
}
