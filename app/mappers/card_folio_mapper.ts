import CardFolio from '#models/card_folio'
import { FolioStatisticsOutputDTO } from '#types/folio_type'
import PriceUtils from '#utils/price_utils'

export default class CardFolioMapper {
  public static toFolioStatisticsOutputDTO(
    todayCardFolios: CardFolio[],
    yesterdayCardFolios: CardFolio[]
  ): FolioStatisticsOutputDTO {
    const totalCardsCount = todayCardFolios.reduce((acc, cardFolio) => {
      return acc + (cardFolio.occurrence || 0)
    }, 0)

    const todayCardMarketPrice = PriceUtils.getCardMarketTrendPrice(todayCardFolios)
    const yesterdayCardMarketPrice = PriceUtils.getCardMarketTrendPrice(yesterdayCardFolios)

    const todayTcgPlayerPrice = PriceUtils.getLowerTcgPlayerMarketPrice(todayCardFolios)
    const yesterdayTcgPlayerPrice = PriceUtils.getLowerTcgPlayerMarketPrice(yesterdayCardFolios)

    return {
      totalCardsCount,
      cardMarketPrice: todayCardMarketPrice.toFixed(2).toString(),
      tcgPlayerPrice: todayTcgPlayerPrice.toFixed(2).toString(),
      cardMarketTrending: PriceUtils.getPriceTrend(todayCardMarketPrice, yesterdayCardMarketPrice),
      tcgPlayerTrending: PriceUtils.getPriceTrend(todayTcgPlayerPrice, yesterdayTcgPlayerPrice),
    }
  }
}
