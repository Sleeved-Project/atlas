import { ScanNoMatchException } from '#exceptions/iris_exception'
import NotFoundException from '#exceptions/not_found_exception'
import ValidationException from '#exceptions/validation_exception'
import CardMapper from '#mappers/card_mapper'
import CardService from '#services/card_service'
import FileService from '#services/file_service'
import ScanService from '#services/scan_service'
import { CardScanResultOutputDTO } from '#types/card_dto_type'
import { scanValidator } from '#validators/scan_validator'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { errors as lucidErrors } from '@adonisjs/lucid'
import { errors as vineErrors } from '@vinejs/vine'

@inject()
export default class ScanController {
  constructor(
    private cardService: CardService,
    private scanService: ScanService,
    private fileService: FileService
  ) {}

  async analyze({ response, request }: HttpContext) {
    try {
      const { file } = await request.validateUsing(scanValidator)
      const filePath = await this.fileService.saveFile(file)

      const result = await this.scanService.getAnalyseResults(
        filePath,
        file.clientName,
        file.headers['content-type']
      )

      const cardScanResults: CardScanResultOutputDTO[] = []

      for (const scanCardInfo of result) {
        const card = await this.cardService.getCardScanResulInfosById(scanCardInfo.id)
        const cardScanResult = CardMapper.toCardScanResultOutputDTO(card, scanCardInfo)
        cardScanResults.push(cardScanResult)
      }
      return response.ok(cardScanResults)
    } catch (error) {
      if (error instanceof vineErrors.E_VALIDATION_ERROR) {
        throw new ValidationException(error)
      }
      if (error instanceof lucidErrors.E_ROW_NOT_FOUND) {
        throw new NotFoundException(error)
      }
      throw error
    } finally {
      this.fileService.cleanup()
    }
  }

  async identify({ response, request }: HttpContext) {
    try {
      const { file, threshold } = await request.validateUsing(scanValidator)
      const filePath = await this.fileService.saveFile(file)

      const cardIdentificationResult = await this.scanService.getIdentifyResult(
        filePath,
        file.clientName,
        file.headers['content-type'],
        threshold
      )

      if (!cardIdentificationResult) {
        throw new ScanNoMatchException()
      }

      if (cardIdentificationResult.id === 'back-side') {
        const formattedBackSideCardResult =
          CardMapper.toBackSideCardIdentifyResultOutputDTO(cardIdentificationResult)

        return response.ok(formattedBackSideCardResult)
      }

      const cardDetails = await this.cardService.getMinimalCardDetailById(
        cardIdentificationResult.id
      )

      const formattedFrontSideCardResult = CardMapper.toCardScanIdentifyResultOutputDTO(
        cardDetails,
        cardIdentificationResult
      )

      return response.ok(formattedFrontSideCardResult)
    } catch (error) {
      if (error instanceof vineErrors.E_VALIDATION_ERROR) {
        throw new ValidationException(error)
      }
      if (error instanceof lucidErrors.E_ROW_NOT_FOUND) {
        throw new NotFoundException(error)
      }
      throw error
    } finally {
      this.fileService.cleanup()
    }
  }
}
