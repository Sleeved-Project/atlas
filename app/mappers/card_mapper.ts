import Card from '#models/card'
import { CardPricesOutputDTO } from '#types/card_dto_type'

export default class CardMapper {
  private static formatPriceValue(value: string | number | null): string {
    if (value === null || value === '0.00' || value === 0 || value === '0') {
      return 'unknown'
    }
    return value.toString()
  }

  public static toCardPricesOutputDTO(card: Card): CardPricesOutputDTO {
    const cardMarketPrices = card.cardMarketPrices.length > 0 ? card.cardMarketPrices[0] : null
    const tcgPlayerReporting =
      card.tcgPlayerReportings.length > 0 ? card.tcgPlayerReportings[0] : null

    const result: CardPricesOutputDTO = {
      id: card.id,
      cardMarketReporting: null,
      tcgPlayerReporting: null,
    }

    // Format CardMarket prices
    if (cardMarketPrices) {
      const reverseHoloPrice = cardMarketPrices.reverseHoloTrend?.toString() || null
      const normal = cardMarketPrices.trendPrice?.toString() || null

      result.cardMarketReporting = {
        id: cardMarketPrices.id,
        url: cardMarketPrices.url,
        cardMarketPrices: [
          {
            id: cardMarketPrices.id,
            type: 'normal',
            market: this.formatPriceValue(normal),
          },
          {
            id: cardMarketPrices.id,
            type: 'reverseHolo',
            market: this.formatPriceValue(reverseHoloPrice),
          },
        ],
      }
    }

    // Format TCGPlayer prices
    if (tcgPlayerReporting) {
      result.tcgPlayerReporting = {
        id: tcgPlayerReporting.id,
        url: tcgPlayerReporting.url,
        tcgPlayerPrices: tcgPlayerReporting.tcgPlayerPrices.map((price) => ({
          id: price.id,
          type: price.type,
          market: this.formatPriceValue(price.market),
        })),
      }
    }

    return result
  }
}
