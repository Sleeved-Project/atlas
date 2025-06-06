import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import CardService from '#services/card_service'
import { errors as lucidErrors } from '@adonisjs/lucid'
import { errors as vineErrors } from '@vinejs/vine'
import NotFoundException from '#exceptions/not_found_exception'
import { getAllCardsFiltersValidator } from '#validators/card_validator'
import ValidationException from '#exceptions/validation_exception'

@inject()
export default class CardsController {
  constructor(private cardService: CardService) {}

  async index({ request, response }: HttpContext) {
    try {
      const filters = await getAllCardsFiltersValidator.validate(request.qs())
      const cards = await this.cardService.getAllCards(filters)
      return response.ok(cards)
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
