import CardFolio from '#models/card_folio'
import { FolioStatistics, PriceTrending } from '#types/folio_type'

export default class CardFolioMapper {
  public static toFolioStatistics(
    todayCardFolios: CardFolio[],
    yesterdayCardFolios: CardFolio[]
  ): FolioStatistics {
    const totalCardsCount = todayCardFolios.reduce((acc, cardFolio) => {
      return acc + (cardFolio.occurrence || 0)
    }, 0)

    const todayCardMarketPrice = this.getCardMarketTrendPrice(todayCardFolios)
    const yesterdayCardMarketPrice = this.getCardMarketTrendPrice(yesterdayCardFolios)

    const todayTcgPlayerPrice = this.getLowerTcgPlayerMarketPrice(todayCardFolios)
    const yesterdayTcgPlayerPrice = this.getLowerTcgPlayerMarketPrice(yesterdayCardFolios)

    return {
      totalCardsCount,
      cardMarketPrice: todayCardMarketPrice.toFixed(2).toString(),
      tcgPlayerPrice: todayTcgPlayerPrice.toFixed(2).toString(),
      cardMarketTrending: this.getPriceTrend(todayCardMarketPrice, yesterdayCardMarketPrice),
      tcgPlayerTrending: this.getPriceTrend(todayTcgPlayerPrice, yesterdayTcgPlayerPrice),
    }
  }

  public static getPriceTrend(todayPrice: number, yesterdayPrice: number): 'up' | 'down' | 'equal' {
    if (todayPrice > yesterdayPrice) {
      return PriceTrending.UP
    } else if (todayPrice < yesterdayPrice) {
      return PriceTrending.DOWN
    }
    return PriceTrending.EQUAL
  }

  public static getLowerTcgPlayerMarketPrice(cardFolios: CardFolio[]): number {
    return cardFolios.reduce((acc, cardFolio) => {
      const firstTcgPlayerReporting = cardFolio.card?.tcgPlayerReportings?.[0]
      const lowerTcgPlayerMarketPrice = firstTcgPlayerReporting.tcgPlayerPrices.sort(
        (a, b) => (b.market || 0) - (a.market || 0)
      )[0].market
      const marketPrice = +(lowerTcgPlayerMarketPrice || 0)
      if (marketPrice) {
        return acc + marketPrice
      }
      return acc
    }, 0)
  }

  public static getCardMarketTrendPrice(cardFolios: CardFolio[]): number {
    return cardFolios.reduce((acc, cardFolio) => {
      const firstCardMarketPrice = cardFolio.card?.cardMarketPrices?.[0]
      const trendPrice = +(firstCardMarketPrice.trendPrice || 0)
      if (trendPrice) {
        return acc + trendPrice
      }
      return acc
    }, 0)
  }
}
