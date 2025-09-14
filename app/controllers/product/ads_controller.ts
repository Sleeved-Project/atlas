import NotFoundException from '#exceptions/not_found_exception'
import ValidationException from '#exceptions/validation_exception'
import Certificate from '#models/certificate'
import AdService from '#services/ad_service'
import CardService from '#services/card_service'
import CertificateService from '#services/certificate_service'
import FileService from '#services/file_service'
import { SuccessOutputDTO } from '#types/success_output_dto_type'
import {
  createAdValidator,
  getAdBaseParamsValidator,
  listAdsValidator,
  searchAdsValidator,
} from '#validators/ad_validator'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { errors as lucidErrors } from '@adonisjs/lucid'
import { errors as vineErrors } from '@vinejs/vine'
import MediaUploadService from '#services/media_upload_service'

@inject()
export default class AdsController {
  constructor(
    private cardService: CardService,
    private certificateService: CertificateService,
    private adService: AdService,
    private fileService: FileService,
    private mediaUploadService: MediaUploadService
  ) {}

  async store({ request, response, authUser }: HttpContext) {
    try {
      const { versoFile, rectoFile, ...cardData } = await request.validateUsing(createAdValidator)

      const versoPath = await this.fileService.saveFile(versoFile)
      const rectoPath = await this.fileService.saveFile(rectoFile)

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

      // Upload files to Cloudinary
      const rectoUrl = await this.mediaUploadService.upload(rectoPath, 'ads/recto')
      const versoUrl = await this.mediaUploadService.upload(versoPath, 'ads/verso')

      // Create ad with published status
      await this.adService.createAd(
        authUser.id,
        cardData.finishId,
        cardData.conditionId,
        card.id,
        rectoUrl,
        versoUrl,
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
      this.fileService.cleanup()
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

  async search({ request, response }: HttpContext) {
    try {
      const query = await searchAdsValidator.validate(request.qs())
      const ads = await this.adService.searchAds(query)
      return response.ok(ads)
    } catch (error) {
      if (error instanceof vineErrors.E_VALIDATION_ERROR) {
        throw new ValidationException(error)
      }
      throw error
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const validatedParams = await getAdBaseParamsValidator.validate(params)
      const ad = await this.adService.getAdById(validatedParams.id)
      return response.ok(ad)
    } catch (error) {
      if (error instanceof lucidErrors.E_ROW_NOT_FOUND) {
        throw new NotFoundException(error)
      }
      throw error
    }
  }
}
