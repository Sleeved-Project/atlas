import NotFoundException from '#exceptions/not_found_exception'
import ValidationException from '#exceptions/validation_exception'
import CardMapper from '#mappers/card_mapper'
import CardMarketPriceMapper from '#mappers/card_market_price_mapper'
import CardProcessor from '#processors/card_processor'
import CardConditionService from '#services/card_condition_service'
import CardFinishService from '#services/card_finish_service'
import CardMarketPriceService from '#services/card_market_price_service'
import CardService from '#services/card_service'
import {
  getAllCardsFiltersValidator,
  getCardAdsByCardIdValidator,
  getCardBaseParamsValidator,
  getCardDetailParamsValidator,
  getCardPriceAdviceValidator,
  getCardPriceParamsValidator,
} from '#validators/card_validator'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { errors as lucidErrors } from '@adonisjs/lucid'
import { errors as vineErrors } from '@vinejs/vine'

@inject()
export default class CardsController {
  constructor(
    private cardService: CardService,
    private cardMarketPriceService: CardMarketPriceService,
    private cardConditionService: CardConditionService,
    private cardFinishService: CardFinishService,
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
      const card = await this.cardService.getLastCardPricesById(params.id)
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

  async advices({ response, request }: HttpContext) {
    try {
      const { params, query } = await getCardPriceAdviceValidator.validate({
        params: request.params(),
        query: request.qs(),
      })

      const card = await this.cardService.getCardIdById(params.id)
      const cardFinish = await this.cardFinishService.getFinishById(query.finishes)
      const cardCondition = await this.cardConditionService.getConditionById(query.conditions)
      const lastCardMarketPrice = await this.cardMarketPriceService.getLastCardMarketPricesByCardId(
        card.id
      )

      const advicePrice = CardMarketPriceMapper.toCardAdvicePriceOutputDTO(
        lastCardMarketPrice,
        cardFinish,
        cardCondition
      )

      return response.ok({ advicePrice })
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

  async ads({ response, request, authUser }: HttpContext) {
    try {
      const { params, query } = await getCardAdsByCardIdValidator.validate({
        params: request.params(),
        query: request.qs(),
      })
      const cardAds = await this.cardService.getPaginatedCardAdsByCardId(
        params.id,
        authUser.id,
        query
      )
      return response.ok(cardAds)
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
