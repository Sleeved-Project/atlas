import { FileUploadException } from '#exceptions/file_upload_exception'
import NotFoundException from '#exceptions/not_found_exception'
import ValidationException from '#exceptions/validation_exception'
import CardMapper from '#mappers/card_mapper'
import CardService from '#services/card_service'
import ScanService from '#services/scan_service'
import { CardScanResultOutputDTO } from '#types/card_dto_type'
import { scanAnalyzeValidator } from '#validators/scan_validator'
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
      ;({ file } = await request.validateUsing(scanAnalyzeValidator))

      await file.move(app.makePath('storage/uploads'), {
        name: `${cuid()}.${file.extname}`,
      })

      if (!file.filePath) {
        throw new FileUploadException()
      }

      console.log(file.headers['content-type'])

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
      console.error('ScanController.analyse error:', error)
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
}
