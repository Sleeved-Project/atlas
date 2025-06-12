import app from '@adonisjs/core/services/app'
import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import CardService from '#services/card_service'
import { errors as lucidErrors } from '@adonisjs/lucid'
import { errors as vineErrors } from '@vinejs/vine'
import NotFoundException from '#exceptions/not_found_exception'
import ValidationException from '#exceptions/validation_exception'
import { scanAnalyzeValidator } from '#validators/scan_validator'
import ScanService from '#services/scan_service'
import { cuid } from '@adonisjs/core/helpers'
import { Exception } from '@adonisjs/core/exceptions'
import Card from '#models/card'
import CardMarketPrice from '#models/card_market_price'
import TcgPlayerReporting from '#models/tcg_player_reporting'

type CardScanResultDTO = {
  id: string
  imageSmall: string
  imageLarge: string
  bestTrendPrice: string
  similarity: number
}

@inject()
export default class ScanController {
  constructor(
    private cardService: CardService,
    private scanService: ScanService
  ) {}

  async analyze({ response, request }: HttpContext) {
    try {
      const { file } = await request.validateUsing(scanAnalyzeValidator)

      await file.move(app.makePath('storage/uploads'), {
        name: `${cuid()}.${file.extname}`,
      })

      if (!file.filePath) {
        // !!! faire une nouvelle exception
        throw new vineErrors.E_VALIDATION_ERROR('File upload failed')
      }

      const result = await this.scanService.getAnalyseResults(
        file.filePath,
        file.clientName,
        file.headers['content-type']
      )

      if (!result || result.length === 0) {
        throw new Exception('No matching cards found for the scan')
      }

      const cardScanResults: CardScanResultDTO[] = []
      // for all cards in dto, get the card base result by id
      for (const card of result) {
        const cardScanResultInfos = await this.cardService.getCardScanResulInfosById(card.id)
        const cardScanResult = {
          id: cardScanResultInfos.id,
          imageSmall: cardScanResultInfos.imageSmall,
          imageLarge: cardScanResultInfos.imageLarge,
          bestTrendPrice: this.getBestPriceFromCardScanResulInfos(cardScanResultInfos),
          similarity: card.similarity,
        }
        cardScanResults.push(cardScanResult)
      }
      // sort the result by similarity percentage
      return response.ok(cardScanResults)
    } catch (error) {
      if (error instanceof vineErrors.E_VALIDATION_ERROR) {
        throw new ValidationException(error)
      }
      if (error instanceof lucidErrors.E_ROW_NOT_FOUND) {
        throw new NotFoundException(error)
      }
      throw error
    }
  }

  public getBestPriceFromCardScanResulInfos(card: Card): string {
    console.log(card)
    // !! tester si l'un des deux parent est null ou empty
    const cardMarketPrices = card.cardMarketPrices
    const tcgPlayerReportings = card.tcgPlayerReportings
    if (
      (!cardMarketPrices || cardMarketPrices.length === 0) &&
      (!tcgPlayerReportings || tcgPlayerReportings.length === 0)
    ) {
      return 'No price available'
    }

    const todayCardMarketPrices = cardMarketPrices[0]
    const todayTcgPlayerReporting = tcgPlayerReportings[0]

    const bestTodayCardMarketPrice = this.getTodayCardMarketPrice(todayCardMarketPrices)
    const besttodayTcgPlayerReportingPrice =
      this.getTodayTcgPlayerReportingPrice(todayTcgPlayerReporting)

    // comparer les deux prix
    const bestPrice =
      bestTodayCardMarketPrice >= besttodayTcgPlayerReportingPrice
        ? bestTodayCardMarketPrice
        : besttodayTcgPlayerReportingPrice

    console.log('BESTPRICE', bestPrice)

    return bestPrice.toString()
  }

  public getTodayTcgPlayerReportingPrice(tcgPlayerReporting: TcgPlayerReporting): number {
    const tcgPlayerReportingPrices = tcgPlayerReporting.tcgPlayerPrices
    if (!tcgPlayerReportingPrices || tcgPlayerReportingPrices.length === 0) {
      return 0
    }
    const bestTcgPlayerReportingPrice = tcgPlayerReportingPrices[0]
    return bestTcgPlayerReportingPrice.market || 0
  }

  public getTodayCardMarketPrice(cardMarketPrice: CardMarketPrice): number {
    const reverseHoloTrend = cardMarketPrice.reverseHoloTrend || 0
    const trendPrice = cardMarketPrice.trendPrice || 0
    return trendPrice >= reverseHoloTrend ? trendPrice : reverseHoloTrend
  }
}
