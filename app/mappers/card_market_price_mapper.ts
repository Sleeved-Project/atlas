import CardCondition from '#models/card_condition'
import CardFinish from '#models/card_finish'
import CardMarketPrice from '#models/card_market_price'
import { CardFinishType } from '#types/card_finish_type'
import PriceUtils from '#utils/price_utils'

export default class CardMarketPriceMapper {
  /**
   * Converts a Card object to a CardPricesOutputDTO.
   */
  public static toCardAdvicePriceOutputDTO(
    cardMarketPrice: CardMarketPrice | null,
    cardFinish: CardFinish,
    cardCondition: CardCondition
  ): string {
    if (!cardMarketPrice) return PriceUtils.UNKNOWN_PRICE

    let basePrice = PriceUtils.DEFAULT_PRICE

    const finishType = cardFinish.label.toLowerCase()

    switch (finishType) {
      case CardFinishType.HOLOFOIL:
      case CardFinishType.REVERSE_HOLOFOIL:
        basePrice = cardMarketPrice.reverseHoloTrend || PriceUtils.DEFAULT_PRICE
        break
      case CardFinishType.NORMAL:
        basePrice = cardMarketPrice.trendPrice || PriceUtils.DEFAULT_PRICE
        break
      default:
        basePrice = PriceUtils.DEFAULT_PRICE
    }

    const alterationMultiplier = 1 + cardCondition.percentPriceAlteration / 100
    const finalPrice = basePrice * alterationMultiplier

    return PriceUtils.formatPriceValue(finalPrice.toFixed(2))
  }
}
