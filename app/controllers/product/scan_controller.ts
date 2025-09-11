import { FileUploadException } from '#exceptions/file_upload_exception'
import NotFoundException from '#exceptions/not_found_exception'
import ValidationException from '#exceptions/validation_exception'
import CardMapper from '#mappers/card_mapper'
import CardService from '#services/card_service'
import ScanService from '#services/scan_service'
import { CardScanResultOutputDTO } from '#types/card_dto_type'
import { scanValidator } from '#validators/scan_validator'
import { inject } from '@adonisjs/core'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { errors as lucidErrors } from '@adonisjs/lucid'
import { errors as vineErrors } from '@vinejs/vine'
import fs from 'node:fs'

@inject()
export default class ScanController {
  constructor(
    private cardService: CardService,
    private scanService: ScanService
  ) {}

  async analyze({ response, request }: HttpContext) {
    let file: MultipartFile | undefined
    try {
      ;({ file } = await request.validateUsing(scanValidator))

      await file.move(app.makePath('storage/uploads'), {
        name: `${cuid()}.${file.extname}`,
      })

      if (!file.filePath) {
        throw new FileUploadException()
      }

      const result = await this.scanService.getAnalyseResults(
        file.filePath,
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
      if (file && file.filePath) {
        fs.rmSync(file.filePath)
      }
    }
  }

  async identify({ response, request }: HttpContext) {
    let file: MultipartFile | undefined
    try {
      ;({ file } = await request.validateUsing(scanValidator))

      await file.move(app.makePath('storage/uploads'), {
        name: `${cuid()}.${file.extname}`,
      })

      if (!file.filePath) {
        throw new FileUploadException()
      }

      const cardIdentificationResult = await this.scanService.getIdentifyResult(
        file.filePath,
        file.clientName,
        file.headers['content-type']
      )

      if (!cardIdentificationResult) {
        return response.notFound({ message: "Aucune carte valide détectée dans l'image" })
      }

      const cardDetails = await this.cardService.getMinimalCardDetailById(
        cardIdentificationResult.id
      )

      const formattedCardResult = CardMapper.toCardScanIdentifyResultOutputDTO(
        cardDetails,
        cardIdentificationResult
      )

      return response.ok(formattedCardResult)
    } catch (error) {
      if (error instanceof vineErrors.E_VALIDATION_ERROR) {
        throw new ValidationException(error)
      }
      throw error
    } finally {
      if (file && file.filePath) {
        fs.rmSync(file.filePath)
      }
    }
  }
}
