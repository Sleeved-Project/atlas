import Card from '#models/card'
import { CardPricesOutputDTO } from '#types/card_dto_type'

export default class CardMapper {
  public static toCardPricesOutputDTO(card: Card): CardPricesOutputDTO {
    const cardMarketPrices = card.cardMarketPrices.length > 0 ? card.cardMarketPrices[0] : null
    const tcgPlayerReporting =
      card.tcgPlayerReportings.length > 0 ? card.tcgPlayerReportings[0] : null

    if (cardMarketPrices === null) {
      return {
        id: card.id,
        cardMarketReporting: null,
        tcgPlayerReporting: tcgPlayerReporting,
      }
    }

    const reverseHoloPrice = cardMarketPrices.reverseHoloTrend?.toString() || null
    const normal = cardMarketPrices.trendPrice?.toString() || null

    return {
      id: card.id,
      cardMarketReporting: {
        id: cardMarketPrices.id,
        url: cardMarketPrices.url,
        cardMarketPrices: [
          {
            id: cardMarketPrices.id,
            type: 'normal',
            market: normal,
          },
          {
            id: cardMarketPrices.id,
            type: 'reverseHolo',
            market: reverseHoloPrice,
          },
        ],
      },
      tcgPlayerReporting: tcgPlayerReporting,
    }
  }
}
