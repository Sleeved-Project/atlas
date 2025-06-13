import Card from '#models/card'
import CardMarketPrice from '#models/card_market_price'
import TcgPlayerReporting from '#models/tcg_player_reporting'
import { CardPricesOutputDTO, CardScanResultOutputDTO } from '#types/card_dto_type'
import { ScanCardInfoDTO } from '#types/iris_type'

export default class CardMapper {
  private static readonly UNKNOWN_PRICE = 'unknown'
  private static readonly DEFAULT_PRICE = 0

  public static formatPriceValue(value: string | number | null): string {
    if (value === null || value === '0.00' || value === 0 || value === '0') {
      return this.UNKNOWN_PRICE
    }
    return value.toString()
  }

  /**
   * Converts a Card object to a CardPricesOutputDTO.
   */
  public static toCardPricesOutputDTO(card: Card): CardPricesOutputDTO {
    // Ensures that the card is not null
    if (!card) throw new Error('Card cannot be null')

    const result: CardPricesOutputDTO = {
      id: card.id,
      cardMarketReporting: null,
      tcgPlayerReporting: null,
    }

    // Formats CardMarket prices
    result.cardMarketReporting = this.formatCardMarketReporting(card.cardMarketPrices?.[0])

    // Formats TCGPlayer prices
    result.tcgPlayerReporting = this.formatTcgPlayerReporting(card.tcgPlayerReportings?.[0])

    return result
  }

  /**
   * Formats the CardMarketPrice object to a DTO.
   */
  public static formatCardMarketReporting(cardMarketPrice: CardMarketPrice | null | undefined) {
    if (!cardMarketPrice) return null

    const reverseHoloPrice = cardMarketPrice.reverseHoloTrend?.toString() || null
    const normal = cardMarketPrice.trendPrice?.toString() || null

    return {
      id: cardMarketPrice.id,
      url: cardMarketPrice.url,
      cardMarketPrices: [
        {
          id: cardMarketPrice.id,
          type: 'normal',
          market: this.formatPriceValue(normal),
        },
        {
          id: cardMarketPrice.id,
          type: 'reverseHolo',
          market: this.formatPriceValue(reverseHoloPrice),
        },
      ],
    }
  }

  /**
   * Formats the TcgPlayerReporting object to a DTO.
   */
  public static formatTcgPlayerReporting(
    tcgPlayerReporting: TcgPlayerReporting | null | undefined
  ) {
    if (!tcgPlayerReporting) return null

    return {
      id: tcgPlayerReporting.id,
      url: tcgPlayerReporting.url,
      tcgPlayerPrices: (tcgPlayerReporting.tcgPlayerPrices || []).map((price) => ({
        id: price.id,
        type: price.type,
        market: this.formatPriceValue(price.market),
      })),
    }
  }

  /**
   * Converts a Card and ScanCardInfoDTO to a CardScanResultOutputDTO.
   */
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

  public static getBestPriceFromCardScanResultInfos(card: Card): string {
    if (!card) return this.UNKNOWN_PRICE

    const cardMarketPrices = card.cardMarketPrices || []
    const tcgPlayerReportings = card.tcgPlayerReportings || []

    if (cardMarketPrices.length === 0 && tcgPlayerReportings.length === 0) {
      return this.UNKNOWN_PRICE
    }

    // cardMarketPrices and tcgPlayerReportings are already sorted in sql request
    const todayCardMarketPrices = cardMarketPrices[0]
    const todayTcgPlayerReporting = tcgPlayerReportings[0]

    const bestCardMarketPrice =
      cardMarketPrices.length > 0
        ? this.getBestCardMarketPrice(todayCardMarketPrices)
        : this.DEFAULT_PRICE

    const bestTcgPlayerPrice =
      tcgPlayerReportings.length > 0
        ? this.getBestTcgPlayerReportingPrice(todayTcgPlayerReporting)
        : this.DEFAULT_PRICE

    // compare prices and return the best one between CardMarket and TCGPlayer
    const bestPrice = Math.max(bestCardMarketPrice, bestTcgPlayerPrice)

    return bestPrice === this.DEFAULT_PRICE ? this.UNKNOWN_PRICE : bestPrice.toString()
  }

  /**
   * Extracts the best price from TcgPlayer prices.
   */
  public static getBestTcgPlayerReportingPrice(
    reporting: TcgPlayerReporting | null | undefined
  ): number {
    if (!reporting || !reporting.tcgPlayerPrices || reporting.tcgPlayerPrices.length === 0) {
      return this.DEFAULT_PRICE
    }

    // Validate that prices are sorted by market price in descending order
    return Math.max(...reporting.tcgPlayerPrices.map((price) => price.market || this.DEFAULT_PRICE))
  }

  /**
   * Extracts the best price from CardMarket prices.
   */
  public static getBestCardMarketPrice(price: CardMarketPrice | null | undefined): number {
    if (!price) {
      return this.DEFAULT_PRICE
    }

    const reverseHoloTrend = price.reverseHoloTrend || this.DEFAULT_PRICE
    const trendPrice = price.trendPrice || this.DEFAULT_PRICE

    return Math.max(trendPrice, reverseHoloTrend)
  }
}
