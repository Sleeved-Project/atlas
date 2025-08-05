import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { errors as lucidErrors } from '@adonisjs/lucid'
import { errors as vineErrors } from '@vinejs/vine'
import NotFoundException from '#exceptions/not_found_exception'
import FolioService from '#services/folio_service'
import CardFolioService from '#services/card_folio_service'
import ValidationException from '#exceptions/validation_exception'
import { getAllMainFolioCardsFiltersValidator } from '#validators/card_validator'
import ConstantUtils from '#utils/constant_utils'
import CardFolioMapper from '#mappers/card_folio_mapper'
import { SuccessOutputDTO } from '#types/success_output_dto_type'
import CardService from '#services/card_service'
import DuplicateEntryException from '#exceptions/duplicate_entry_exception'
import {
  collectValidator,
  removeCardValidator,
  updateOccurrenceValidator,
} from '#validators/folio_validator'

@inject()
export default class MainFoliosController {
  constructor(
    private folioService: FolioService,
    private cardService: CardService,
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
      const lastCardFolios =
        await this.cardFolioService.getAllMainFolioCardPricesAndOccurrenceByDaysBefore(
          mainFolio.id,
          ConstantUtils.DAY_BEFORE_DEFAULT_COUNT
        )
      const dayBeforeLastCardFolios =
        await this.cardFolioService.getAllMainFolioCardPricesAndOccurrenceByDaysBefore(
          mainFolio.id,
          ConstantUtils.DAY_BEFORE_LAST_DAY_COUNT
        )
      const folioStatistics = CardFolioMapper.toFolioStatisticsOutputDTO(
        lastCardFolios,
        dayBeforeLastCardFolios
      )
      return response.ok(folioStatistics)
    } catch (error) {
      if (error instanceof lucidErrors.E_ROW_NOT_FOUND) {
        throw new NotFoundException(error)
      }
      throw error
    }
  }

  async collect({ request, response, authUser }: HttpContext) {
    try {
      const payload = await collectValidator.validate(request.all())
      const card = await this.cardService.getCardIdById(payload.cardId)
      const folio = await this.folioService.getMainFolioByUserId(authUser.id)
      await this.cardFolioService.createCardMainFolio(card.id, folio.id)
      const successResponse: SuccessOutputDTO = {
        message: 'Card added to your main folio successfully',
      }
      return response.ok(successResponse)
    } catch (error) {
      if (error instanceof vineErrors.E_VALIDATION_ERROR) {
        throw new ValidationException(error)
      }
      if (error.code === 'ER_DUP_ENTRY') {
        throw new DuplicateEntryException('Card already exists in the folio')
      }
      if (error instanceof lucidErrors.E_ROW_NOT_FOUND) {
        throw new NotFoundException(error)
      }
      throw error
    }
  }

  async updateOccurrence({ request, response, authUser }: HttpContext) {
    try {
      const payload = await request.validateUsing(updateOccurrenceValidator)
      const card = await this.cardService.getCardIdById(payload.params.id)
      const folio = await this.folioService.getMainFolioByUserId(authUser.id)
      await this.cardFolioService.updateCardFolioOccurrence(card.id, folio.id, payload.occurrence)
      const successResponse: SuccessOutputDTO = {
        message: 'Card occurrence updated successfully',
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
    }
  }

  async removeCard({ request, response, authUser }: HttpContext) {
    try {
      const payload = await request.validateUsing(removeCardValidator)
      const card = await this.cardService.getCardIdById(payload.params.id)
      const folio = await this.folioService.getMainFolioByUserId(authUser.id)
      await this.cardFolioService.deleteCardFromFolioByCardIdAndFolioId(card.id, folio.id)
      const successResponse: SuccessOutputDTO = {
        message: 'Card remove from main folio successfully',
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
    }
  }
}
