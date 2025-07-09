import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { errors as lucidErrors } from '@adonisjs/lucid'
import { errors as vineErrors } from '@vinejs/vine'
import NotFoundException from '#exceptions/not_found_exception'
import FolioService from '#services/folio_service'
import { SuccessOutputDTO } from '#types/success_output_dto_type'
import { removeMainValidator } from '#validators/card_folio_validator'
import CardService from '#services/card_service'
import CardFolioService from '#services/card_folio_service'
import ValidationException from '#exceptions/validation_exception'

@inject()
export default class CardFoliosController {
  constructor(
    private folioService: FolioService,
    private cardService: CardService,
    private cardFolioService: CardFolioService
  ) {}

  async delete({ request, response, authUser }: HttpContext) {
    try {
      const payload = await request.validateUsing(removeMainValidator)
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
