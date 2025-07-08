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
import CardProcessor from '#processors/card_processor'

@inject()
export default class CardsController {
  constructor(
    private cardService: CardService,
    private cardProcessor: CardProcessor
  ) {}

  async index({ request, response, authUser }: HttpContext) {
    try {
      const filters = await getAllCardsFiltersValidator.validate(request.qs())
      const paginatedCards = await this.cardService.getAllCards(filters)
      const result = await this.cardProcessor.processCardsWithOwnership(paginatedCards, authUser.id)
      return response.ok(result)
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

  async show({ response, request, authUser }: HttpContext) {
    try {
      const params = await getCardBaseParamsValidator.validate(request.params())
      const card = await this.cardService.getCardBasesByIdAndUserId(params.id, authUser.id)
      const cardBaseOutputDTO = CardMapper.toCardBaseOuputDTO(card)
      return response.ok(cardBaseOutputDTO)
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
