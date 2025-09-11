import { FileUploadException } from '#exceptions/file_upload_exception'
import NotFoundException from '#exceptions/not_found_exception'
import ValidationException from '#exceptions/validation_exception'
import CardMapper from '#mappers/card_mapper'
import IrisMapper from '#mappers/iris_mapper'
import { getGradeLabel } from '#services/grade_service'
import CardService from '#services/card_service'
import ScanService from '#services/scan_service'
import { CardScanResultOutputDTO } from '#types/card_dto_type'
import { gradingValidator } from '#validators/grade_validator'
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

  async grade({ response, request }: HttpContext) {
    let file: MultipartFile | undefined
    try {
      ;({ file } = await request.validateUsing(gradingValidator))

      await file.move(app.makePath('storage/uploads'), {
        name: `${cuid()}.${file.extname}`,
      })

      if (!file.filePath) {
        throw new FileUploadException()
      }

      const gradingResponse = await this.scanService.getGradingResults(
        file.filePath,
        file.clientName,
        file.headers['content-type']
      )

      // Gestion du cas "aucun match"
      if (!gradingResponse.grades || gradingResponse.grades.length === 0) {
        return response.notFound({
          code: 'E_IRIS_NO_MATCH',
          message: 'No matching cards found for the scan',
        })
      }

      const gradingResultsDTO = IrisMapper.toGradingOutputDTO(gradingResponse)

      // Ajout du label et suppression de topClassMatches
      const gradingResultsWithLabel = await Promise.all(
        gradingResultsDTO.map(async (dto) => ({
          averageScore: dto.averageScore,
          details: dto.details,
          label: (await getGradeLabel(dto.averageScore)) || 'Unknown',
        }))
      )

      return response.ok(gradingResultsWithLabel)
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
}
