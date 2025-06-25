import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { errors as lucidErrors } from '@adonisjs/lucid'
import { errors as vineErrors } from '@vinejs/vine'
import NotFoundException from '#exceptions/not_found_exception'
import FolioService from '#services/folio_service'
import CardService from '#services/card_service'
import { SuccessOutputDto } from '#types/success_output_dto_type'
import ValidationException from '#exceptions/validation_exception'
import { collectValidator } from '#validators/card_folio_validator'
import CardFolioService from '#services/card_folio_service'
import DuplicateEntryException from '#exceptions/duplicate_entry_exception'

@inject()
export default class CardFoliosController {
  constructor(
    private folioService: FolioService,
    private cardService: CardService,
    private cardFolioService: CardFolioService
  ) {}

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
}
