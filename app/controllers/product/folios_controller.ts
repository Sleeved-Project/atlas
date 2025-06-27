import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { errors as lucidErrors } from '@adonisjs/lucid'
import { errors as vineErrors } from '@vinejs/vine'
import NotFoundException from '#exceptions/not_found_exception'
import FolioService from '#services/folio_service'
import { SuccessOutputDto } from '#types/success_output_dto_type'
import { collectValidator } from '#validators/folio_validator'
import CardService from '#services/card_service'
import CardFolioService from '#services/card_folio_service'
import ValidationException from '#exceptions/validation_exception'
import DuplicateEntryException from '#exceptions/duplicate_entry_exception'
import { getAllMainFolioCardsFiltersValidator } from '#validators/card_validator'
import CardMapper from '#mappers/card_mapper'

@inject()
export default class FoliosController {
  constructor(
    private folioService: FolioService,
    private cardService: CardService,
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

  async collect({ request, response, authUser }: HttpContext) {
    try {
      const payload = await collectValidator.validate(request.all())
      const card = await this.cardService.getCardBaseById(payload.cardId)
      const folio = await this.folioService.getMainFolioByUserId(authUser.id)
      await this.cardFolioService.createCardFolio(card.id, folio.id)
      const successResponse: SuccessOutputDto = {
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

  async cards({ request, response, authUser }: HttpContext) {
    try {
      const filters = await getAllMainFolioCardsFiltersValidator.validate(request.qs())
      const paginatedCards = await this.cardService.getAllMainFolioCards(filters, authUser.id)

      if (paginatedCards.total === 0) {
        return response.ok(paginatedCards)
      }

      const mainFolioPaginatedCards = CardMapper.toCardsWithFolioOccurenceOutputDTO(paginatedCards)

      return response.ok(mainFolioPaginatedCards)
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
