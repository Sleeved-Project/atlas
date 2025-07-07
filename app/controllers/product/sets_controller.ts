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
      if (error instanceof vineErrors.E_VALIDATION_ERROR) {
        throw new ValidationException(error)
      }
      throw error
    }
  }

  async details({ response, request }: HttpContext) {
    try {
      const params = await getSetDetailParamsValidator.validate(request.params())
      const set = await this.setService.getSetDetailById(params.id)
      const todaySetCards = await this.cardService.getAllMainSetCardPricesAndOccurrenceByDaysBefore(
        params.id,
        1
      )

      const yesterdaySetCards =
        await this.cardService.getAllMainSetCardPricesAndOccurrenceByDaysBefore(params.id, 2)

      const setStatistics = SetCardsMapper.toSetStatisticsOutput(
        set,
        todaySetCards,
        yesterdaySetCards
      )

      return response.ok(setStatistics)
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
      const { params, filters } = await getSetCardsValidator.validate({
        params: request.params(),
        filters: request.qs(),
      })
      const cards = await this.cardService.getAllCardsBySetIdAndPaginate(filters, params.id)
      return response.ok(cards)
    } catch (error) {
      if (error instanceof lucidErrors.E_ROW_NOT_FOUND) {
        throw new NotFoundException(error)
      }
      throw error
    }
  }
}
