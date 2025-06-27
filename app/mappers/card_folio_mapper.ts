import CardFolio from '#models/card_folio'
import { FolioStatistics } from '#types/folio_type'

export default class CardFolioMapper {
  public static toFolioStatistics(cardFolios: CardFolio[]): FolioStatistics {
    const totalCardsCount = cardFolios.reduce((acc, cardFolio) => {
      return acc + (cardFolio.occurrence || 0)
    }, 0)

    const cardMarketPrice = this.getCardMarketTrendPrice(cardFolios)

    const tcgPlayerPrice = this.getLowerTcgPlayerMarketPrice(cardFolios)

    return {
      totalCardsCount,
      cardMarketPrice: cardMarketPrice.toString(),
      tcgPlayerPrice: tcgPlayerPrice.toString(),
    }
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

      if (firstCardMarketPrice) {
        return acc + trendPrice
      }
      return acc
    }, 0)
  }
}
