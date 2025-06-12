import Card from '#models/card'
import CardMarketPrice from '#models/card_market_price'
import TcgPlayerReporting from '#models/tcg_player_reporting'
import { CardPricesOutputDTO, CardScanResultOutputDTO } from '#types/card_dto_type'
import { ScanCardInfoDTO } from '#types/iris_type'

export default class CardMapper {
  private static readonly UNKNOWN_PRICE = 'unknown'
  private static readonly DEFAULT_PRICE = 0

  private static formatPriceValue(value: string | number | null): string {
    if (value === null || value === '0.00' || value === 0 || value === '0') {
      return this.UNKNOWN_PRICE
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

  public static toCardScanResultOutputDTO(
    card: Card,
    scanCardInfo: ScanCardInfoDTO
  ): CardScanResultOutputDTO {
    return {
      id: card.id,
      imageSmall: card.imageSmall,
      imageLarge: card.imageLarge,
      bestTrendPrice: this.getBestPriceFromCardScanResultInfos(card),
      similarity: scanCardInfo.similarity,
    }
  }

  protected static getBestPriceFromCardScanResultInfos(card: Card): string {
    const cardMarketPrices = card.cardMarketPrices
    const tcgPlayerReportings = card.tcgPlayerReportings
    if (
      (!cardMarketPrices || cardMarketPrices.length === 0) &&
      (!tcgPlayerReportings || tcgPlayerReportings.length === 0)
    ) {
      return 'No price available'
    }

    // cardMarketPrices and tcgPlayerReportings are already sorted in sql request
    const todayCardMarketPrices = cardMarketPrices[0]
    const todayTcgPlayerReporting = tcgPlayerReportings[0]

    const bestTodayCardMarketPrice = this.getTodayCardMarketPrice(todayCardMarketPrices)
    const besttodayTcgPlayerReportingPrice =
      this.getTodayTcgPlayerReportingPrice(todayTcgPlayerReporting)

    // compare prices and return the best one between CardMarket and TCGPlayer
    const bestPrice =
      bestTodayCardMarketPrice >= besttodayTcgPlayerReportingPrice
        ? bestTodayCardMarketPrice
        : besttodayTcgPlayerReportingPrice

    return this.formatPriceValue(bestPrice)
  }

  protected static getTodayTcgPlayerReportingPrice(
    todayTcgPlayerReporting: TcgPlayerReporting
  ): number {
    const todayTcgPlayerReportingPrices = todayTcgPlayerReporting.tcgPlayerPrices
    if (!todayTcgPlayerReportingPrices || todayTcgPlayerReportingPrices.length === 0) {
      return this.DEFAULT_PRICE
    }
    // tcgPlayerReportingPrice are already sorted by price in sql request
    const bestTcgPlayerReportingPrice = todayTcgPlayerReportingPrices[0]
    return bestTcgPlayerReportingPrice.market || this.DEFAULT_PRICE
  }

  protected static getTodayCardMarketPrice(todayCardMarketPrice: CardMarketPrice): number {
    if (!todayCardMarketPrice) {
      return this.DEFAULT_PRICE
    }
    const reverseHoloTrend = todayCardMarketPrice.reverseHoloTrend || this.DEFAULT_PRICE
    const trendPrice = todayCardMarketPrice.trendPrice || this.DEFAULT_PRICE
    return trendPrice >= reverseHoloTrend ? trendPrice : reverseHoloTrend
  }
}
