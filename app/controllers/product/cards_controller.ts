import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import CardService from '#services/card_service'
import { errors as lucidErrors } from '@adonisjs/lucid'
import { errors as vineErrors } from '@vinejs/vine'
import NotFoundException from '#exceptions/not_found_exception'
import {
  getAllCardsFiltersValidator,
  getCardBaseParamsValidator,
  getCardDetailParamsValidator,
  getCardPriceParamsValidator,
} from '#validators/card_validator'
import ValidationException from '#exceptions/validation_exception'
import CardMapper from '#mappers/card_mapper'

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

  async show({ response, request }: HttpContext) {
    try {
      const params = await getCardBaseParamsValidator.validate(request.params())
      const card = await this.cardService.getCardBaseById(params.id)
      return response.ok(card)
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

  async details({ response, request }: HttpContext) {
    try {
      const params = await getCardDetailParamsValidator.validate(request.params())
      const card = await this.cardService.getCardDetailById(params.id)
      return response.ok(card)
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

  async prices({ response, request }: HttpContext) {
    try {
      const params = await getCardPriceParamsValidator.validate(request.params())
      const card = await this.cardService.getTodayCardPricesById(params.id)
      const cardPriceMapped = CardMapper.toCardPricesOutputDTO(card)
      return response.ok(cardPriceMapped)
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
