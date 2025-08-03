import CardFolio from '#models/card_folio'
import { FolioStatisticsOutputDTO } from '#types/folio_type'
import PriceUtils from '#utils/price_utils'

export default class CardFolioMapper {
  public static toFolioStatisticsOutputDTO(
    lastCardFolios: CardFolio[],
    dayBeforeLastCardFolios: CardFolio[]
  ): FolioStatisticsOutputDTO {
    const totalCardsCount = lastCardFolios.reduce((acc, cardFolio) => {
      return acc + (cardFolio.occurrence || 0)
    }, 0)

    const todayCardMarketPrice = PriceUtils.getCardMarketTrendPrice(lastCardFolios)
    const yesterdayCardMarketPrice = PriceUtils.getCardMarketTrendPrice(dayBeforeLastCardFolios)

    const todayTcgPlayerPrice = PriceUtils.getLowerTcgPlayerMarketPrice(lastCardFolios)
    const yesterdayTcgPlayerPrice = PriceUtils.getLowerTcgPlayerMarketPrice(dayBeforeLastCardFolios)

    return {
      totalCardsCount,
      cardMarketPrice: todayCardMarketPrice.toFixed(2).toString(),
      tcgPlayerPrice: todayTcgPlayerPrice.toFixed(2).toString(),
      cardMarketTrending: PriceUtils.getPriceTrend(todayCardMarketPrice, yesterdayCardMarketPrice),
      tcgPlayerTrending: PriceUtils.getPriceTrend(todayTcgPlayerPrice, yesterdayTcgPlayerPrice),
    }
  }
}
