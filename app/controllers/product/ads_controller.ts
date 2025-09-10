import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { errors as lucidErrors } from '@adonisjs/lucid'
import { errors as vineErrors } from '@vinejs/vine'
import NotFoundException from '#exceptions/not_found_exception'
import ValidationException from '#exceptions/validation_exception'
import { SuccessOutputDTO } from '#types/success_output_dto_type'
import CardService from '#services/card_service'
import AdService from '#services/ad_service'
import { MultipartFile } from '@adonisjs/core/bodyparser'
import { adCardSchema, createAdValidator, listAdsValidator } from '#validators/ad_validator'
import app from '@adonisjs/core/services/app'
import { cuid } from '@adonisjs/core/helpers'
import { FileUploadException } from '#exceptions/file_upload_exception'
import type { Infer } from '@vinejs/vine/types'
import fs from 'node:fs'
import CertificateService from '#services/certificate_service'
import Certificate from '#models/certificate'

@inject()
export default class AdsController {
  constructor(
    private cardService: CardService,
    private certificateService: CertificateService,
    private adService: AdService
  ) {}

  async store({ request, response, authUser }: HttpContext) {
    let versoFile: MultipartFile | undefined
    let rectoFile: MultipartFile | undefined
    let cardData: Infer<typeof adCardSchema>

    try {
      ;({ versoFile, rectoFile, ...cardData } = await request.validateUsing(createAdValidator))

      await versoFile.move(app.makePath('storage/uploads'), {
        name: `${cuid()}.${versoFile.extname}`,
      })

      await rectoFile.move(app.makePath('storage/uploads'), {
        name: `${cuid()}.${rectoFile.extname}`,
      })

      if (!rectoFile.filePath || !versoFile.filePath) {
        throw new FileUploadException()
      }

      let certificate: Certificate | null = null
      // Get card by id for verification
      const card = await this.cardService.getCardIdById(cardData.cardId)

      // Verify authenticity of the certificate
      if (cardData.certificateId) {
        certificate = await this.certificateService.getCertificateByCardIdCertifyedByAndId(
          authUser.id,
          card.id,
          cardData.certificateId
        )
      }

      // !!! Upload files on cloudinary

      // Create ad with published status
      await this.adService.createAd(
        authUser.id,
        cardData.finishId,
        cardData.conditionId,
        card.id,
        rectoFile.filePath,
        versoFile.filePath,
        cardData.price,
        certificate?.id || null
      )
      // retourner une réponse de succès
      const successResponse: SuccessOutputDTO = {
        message: 'Ad published successfully',
      }
      return response.ok(successResponse)
    } catch (error) {
      if (error instanceof vineErrors.E_VALIDATION_ERROR) {
        throw new ValidationException(error)
      }
      if (error instanceof lucidErrors.E_ROW_NOT_FOUND) {
        throw new NotFoundException(error)
      }
      throw error
    } finally {
      if (versoFile && versoFile.filePath) {
        fs.rmSync(versoFile.filePath)
      }
      if (rectoFile && rectoFile.filePath) {
        fs.rmSync(rectoFile.filePath)
      }
    }
  }

  async index({ request, response }: HttpContext) {
    try {
      const filters = await listAdsValidator.validate(request.qs())
      const ads = await this.adService.listAds(filters)
      return response.ok(ads)
    } catch (error) {
      if (error instanceof vineErrors.E_VALIDATION_ERROR) {
        throw new ValidationException(error)
      }
      throw error
    }
  }
}
