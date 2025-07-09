import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { errors as lucidErrors } from '@adonisjs/lucid'
import { errors as vineErrors } from '@vinejs/vine'
import NotFoundException from '#exceptions/not_found_exception'
import FolioService from '#services/folio_service'
import CardFolioService from '#services/card_folio_service'
import ValidationException from '#exceptions/validation_exception'
import { getAllMainFolioCardsFiltersValidator } from '#validators/card_validator'
import ConstanteUtils from '#utils/constante_utils'
import CardFolioMapper from '#mappers/card_folio_mapper'
import { SuccessOutputDTO } from '#types/success_output_dto_type'

@inject()
export default class MainFoliosController {
  constructor(
    private folioService: FolioService,
    private cardFolioService: CardFolioService
  ) {}

  async cards({ request, response, authUser }: HttpContext) {
    try {
      const filters = await getAllMainFolioCardsFiltersValidator.validate(request.qs())
      const mainFolio = await this.folioService.getMainFolioByUserId(authUser.id)
      const paginatedCardFolios = await this.cardFolioService.getAllMainFolioCards(
        filters,
        mainFolio.id
      )
      return response.ok(paginatedCardFolios)
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

  async statistics({ response, authUser }: HttpContext) {
    try {
      const mainFolio = await this.folioService.getMainFolioByUserId(authUser.id) // Get the user's main folio of fail
      const todayCardFolios =
        await this.cardFolioService.getAllMainFolioCardPricesAndOccurrenceByDaysBefore(
          mainFolio.id,
          ConstanteUtils.TODAY_DAY_BEFORE_COUNT
        )
      const yesterdayCardFolios =
        await this.cardFolioService.getAllMainFolioCardPricesAndOccurrenceByDaysBefore(
          mainFolio.id,
          ConstanteUtils.YESTERDAY_DAY_BEFORE_COUNT
        )
      const folioStatistics = CardFolioMapper.toFolioStatisticsOutputDTO(
        todayCardFolios,
        yesterdayCardFolios
      )
      return response.ok(folioStatistics)
    } catch (error) {
      if (error instanceof lucidErrors.E_ROW_NOT_FOUND) {
        throw new NotFoundException(error)
      }
      throw error
    }
  }

  async store({ response, authUser }: HttpContext) {
    try {
      await this.folioService.createMainFolio(authUser.id)
      const successResponse: SuccessOutputDTO = {
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
}
