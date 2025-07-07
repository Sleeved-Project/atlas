import CardFolio from '#models/card_folio'
import { PriceTrending } from '#types/folio_type'

export default class PriceUtils {
  public static getPriceTrend(todayPrice: number, yesterdayPrice: number): PriceTrending {
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
      if (firstTcgPlayerReporting?.tcgPlayerPrices?.length > 0) {
        const lowerTcgPlayerMarketPrice = firstTcgPlayerReporting.tcgPlayerPrices.sort(
          (a, b) => (a.market || 0) - (b.market || 0)
        )[0].market
        const marketPrice = +(lowerTcgPlayerMarketPrice || 0)
        return acc + marketPrice * cardFolio.occurrence
      }
      return acc
    }, 0)
  }

  public static getCardMarketTrendPrice(cardFolios: CardFolio[]): number {
    return cardFolios.reduce((acc, cardFolio) => {
      const firstCardMarketPrice = cardFolio.card?.cardMarketPrices?.[0]
      if (firstCardMarketPrice) {
        const trendPrice = +(firstCardMarketPrice.trendPrice || 0)
        console.log('trendPrice', trendPrice, 'occurrence', cardFolio.occurrence)
        return acc + trendPrice * cardFolio.occurrence
      }
      return acc
    }, 0)
  }
}
