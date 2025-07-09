import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { errors as lucidErrors } from '@adonisjs/lucid'
import { errors as vineErrors } from '@vinejs/vine'
import NotFoundException from '#exceptions/not_found_exception'
import FolioService from '#services/folio_service'
import { SuccessOutputDto } from '#types/success_output_dto_type'
import CardFolioService from '#services/card_folio_service'
import ValidationException from '#exceptions/validation_exception'
import FolioMapper from '#mappers/folio_mapper'
import ConstanteUtils from '#utils/constante_utils'
import { childFolioCardsValidator, showValidator } from '#validators/folio_validator'
import FolioNotOwnedException from '#exceptions/folio_not_owned_exception'
import NotChildFolioException from '#exceptions/not_child_folio_exception'

@inject()
export default class FoliosController {
  constructor(
    private folioService: FolioService,
    private cardFolioService: CardFolioService
  ) {}

  async init({ response, authUser }: HttpContext) {
    try {
      await this.folioService.createMainFolio(authUser.id)
      const successResponse: SuccessOutputDto = {
        message: 'Folio initialized successfully',
      }
      return response.ok(successResponse)
    } catch (error) {
      if (error instanceof lucidErrors.E_ROW_NOT_FOUND) {
        throw new NotFoundException(error)
      }
      throw error
    }
  }

  async show({ request, response, authUser }: HttpContext) {
    try {
      const { params } = await request.validateUsing(showValidator)

      const folio = await this.folioService.getFolioByFolioId(params.id)
      if (folio.userId !== authUser.id) {
        throw new FolioNotOwnedException(folio.id)
      }
      if (folio.isRoot) {
        throw new NotChildFolioException(folio.id)
      }

      const childFolioWithTodayCardPrices = await this.folioService.getMyChildFolioWithCardPrices(
        folio.id,
        ConstanteUtils.TODAY_DAY_BEFORE_COUNT
      )
      const childFolioWithYesterdayCardPrices =
        await this.folioService.getMyChildFolioWithCardPrices(
          folio.id,
          ConstanteUtils.YESTERDAY_DAY_BEFORE_COUNT
        )

      const folioWithStatistics = FolioMapper.toFolioWithStatistics(
        childFolioWithTodayCardPrices,
        childFolioWithYesterdayCardPrices
      )
      return response.ok(folioWithStatistics)
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

  async childFolioCards({ request, response, authUser }: HttpContext) {
    try {
      const { params, filters } = await childFolioCardsValidator.validate({
        params: request.params(),
        filters: request.qs(),
      })

      const folio = await this.folioService.getFolioByFolioId(params.id)
      if (folio.userId !== authUser.id) {
        throw new FolioNotOwnedException(folio.id)
      }
      if (folio.isRoot) {
        throw new NotChildFolioException(folio.id)
      }

      const childFolioCards = await this.cardFolioService.getAllChildFolioCards(filters, params.id)

      return response.ok(childFolioCards)
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
}
