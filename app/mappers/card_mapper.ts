import Card from '#models/card'
import CardMarketPrice from '#models/card_market_price'
import TcgPlayerReporting from '#models/tcg_player_reporting'
import {
  CardBaseOuputDTO,
  CardPricesOutputDTO,
  CardScanIdentifyResultOutputDTO,
  CardScanResultOutputDTO,
} from '#types/card_dto_type'
import { ScanCardInfoDTO } from '#types/iris_type'
import PriceUtils from '#utils/price_utils'

export default class CardMapper {
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
          market: PriceUtils.formatPriceValue(normal),
        },
        {
          id: cardMarketPrice.id,
          type: 'reverseHolo',
          market: PriceUtils.formatPriceValue(reverseHoloPrice),
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
        market: PriceUtils.formatPriceValue(price.market),
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
      extractedTempImageUrl: scanCardInfo.extractedTempImageUrl,
    }
  }

  /**
   * Converts a Card and ScanCardInfoDTO to a CardScanIdentifyResultOutputDTO.
   */
  public static toCardScanIdentifyResultOutputDTO(
    card: Card,
    identifyResult: ScanCardInfoDTO
  ): CardScanIdentifyResultOutputDTO {
    return {
      id: card.id,
      potentialMatchedCard: card.imageSmall,
      name: card.name,
      similarity: identifyResult.similarity,
      extractedTempImageUrl: identifyResult.extractedTempImageUrl,
      is_back_side: false,
    }
  }

  public static toBackSideCardIdentifyResultOutputDTO(
    identifyResult: ScanCardInfoDTO
  ): CardScanIdentifyResultOutputDTO {
    return {
      id: 'back-side',
      potentialMatchedCard: null,
      name: 'Card Back Side',
      similarity: identifyResult.similarity,
      extractedTempImageUrl: identifyResult.extractedTempImageUrl,
      is_back_side: true,
    }
  }

  public static getBestPriceFromCardScanResultInfos(card: Card): string {
    if (!card) return PriceUtils.UNKNOWN_PRICE

    const cardMarketPrices = card.cardMarketPrices || []
    const tcgPlayerReportings = card.tcgPlayerReportings || []

    if (cardMarketPrices.length === 0 && tcgPlayerReportings.length === 0) {
      return PriceUtils.UNKNOWN_PRICE
    }

    // cardMarketPrices and tcgPlayerReportings are already sorted in sql request
    const todayCardMarketPrices = cardMarketPrices[0]
    const todayTcgPlayerReporting = tcgPlayerReportings[0]

    const bestCardMarketPrice =
      cardMarketPrices.length > 0
        ? this.getBestCardMarketPrice(todayCardMarketPrices)
        : PriceUtils.DEFAULT_PRICE

    const bestTcgPlayerPrice =
      tcgPlayerReportings.length > 0
        ? this.getBestTcgPlayerReportingPrice(todayTcgPlayerReporting)
        : PriceUtils.DEFAULT_PRICE

    // compare prices and return the best one between CardMarket and TCGPlayer
    const bestPrice = Math.max(bestCardMarketPrice, bestTcgPlayerPrice)

    return bestPrice === PriceUtils.DEFAULT_PRICE ? PriceUtils.UNKNOWN_PRICE : bestPrice.toString()
  }

  /**
   * Extracts the best price from TcgPlayer prices.
   */
  public static getBestTcgPlayerReportingPrice(
    reporting: TcgPlayerReporting | null | undefined
  ): number {
    if (!reporting || !reporting.tcgPlayerPrices || reporting.tcgPlayerPrices.length === 0) {
      return PriceUtils.DEFAULT_PRICE
    }

    // Validate that prices are sorted by market price in descending order
    return Math.max(
      ...reporting.tcgPlayerPrices.map((price) => price.market || PriceUtils.DEFAULT_PRICE)
    )
  }

  /**
   * Extracts the best price from CardMarket prices.
   */
  public static getBestCardMarketPrice(price: CardMarketPrice | null | undefined): number {
    if (!price) {
      return PriceUtils.DEFAULT_PRICE
    }

    const reverseHoloTrend = price.reverseHoloTrend || PriceUtils.DEFAULT_PRICE
    const trendPrice = price.trendPrice || PriceUtils.DEFAULT_PRICE

    return Math.max(trendPrice, reverseHoloTrend)
  }

  /**
   * transforms a Card object to a CardBaseOuputDTO.
   */
  public static toCardBaseOuputDTO(card: Card): CardBaseOuputDTO {
    const cardData = card.toJSON()

    const occurrence =
      cardData.cardFolios && cardData.cardFolios.length > 0 ? cardData.cardFolios[0].occurrence : 0

    return {
      id: cardData.id,
      imageLarge: cardData.imageLarge,
      number: cardData.number,
      occurrence,
      set: {
        id: cardData.set.id,
        name: cardData.set.name,
        imageSymbol: cardData.set.imageSymbol,
      },
    }
  }
}
