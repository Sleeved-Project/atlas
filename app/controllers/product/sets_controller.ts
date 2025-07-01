import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { errors as lucidErrors } from '@adonisjs/lucid'
import { errors as vineErrors } from '@vinejs/vine'
import NotFoundException from '#exceptions/not_found_exception'
import ValidationException from '#exceptions/validation_exception'
import SetService from '#services/set_service'
import {
  getAllSetsFiltersValidator,
  getSetCardsValidator,
  getSetDetailParamsValidator,
} from '#validators/set_validator'
import CardService from '#services/card_service'
import { SetStatistics } from '#types/set_type'
import SetCardsMapper from '#mappers/set_cards_mapper'

@inject()
export default class SetsController {
  constructor(
    private setService: SetService,
    private cardService: CardService
  ) {}

  async index({ request, response }: HttpContext) {
    try {
      const filters = await getAllSetsFiltersValidator.validate(request.all())
      const sets = await this.setService.getAllSets(filters)
      return response.ok(sets)
    } catch (error) {
      if (error instanceof lucidErrors.E_ROW_NOT_FOUND) {
        throw new NotFoundException(error)
      }
      throw error
    }
  }

  async details({ response, request }: HttpContext) {
    try {
      const params = await getSetDetailParamsValidator.validate(request.params())
      const setModel = await this.setService.getSetDetailById(params.id)
      const set = setModel.toJSON()
      const todaySetCards = await this.cardService.getAllMainSetCardPricesAndOccurrenceByDaysBefore(
        params.id,
        1
      )

      const yesterdaySetCards =
        await this.cardService.getAllMainSetCardPricesAndOccurrenceByDaysBefore(params.id, 2)

      const setStatistics: SetStatistics = SetCardsMapper.toSetStatistics(
        todaySetCards,
        yesterdaySetCards
      )

      const setWithStatistics = {
        ...set,
        statistics: setStatistics,
      }

      return response.ok(setWithStatistics)
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

  async cards({ response, request }: HttpContext) {
    try {
      const payload = await request.validateUsing(getSetCardsValidator)
      const filters = {
        page: payload.page,
        limit: payload.limit,
        name: payload.name,
      }
      const cards = await this.cardService.getAllCardsBySetIdAndPaginate(filters, payload.params.id)
      return response.ok(cards)
    } catch (error) {
      if (error instanceof lucidErrors.E_ROW_NOT_FOUND) {
        throw new NotFoundException(error)
      }
      throw error
    }
  }
}
