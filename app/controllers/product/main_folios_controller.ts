import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { errors as lucidErrors } from '@adonisjs/lucid'
import { errors as vineErrors } from '@vinejs/vine'
import NotFoundException from '#exceptions/not_found_exception'
import FolioService from '#services/folio_service'
import CardFolioService from '#services/card_folio_service'
import ValidationException from '#exceptions/validation_exception'
import { getAllMainFolioCardsFiltersValidator } from '#validators/card_validator'

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
}
