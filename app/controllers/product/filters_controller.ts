import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import FilterService from '#services/filter_service'
import { errors as vineErrors } from '@vinejs/vine'
import { getResourceFiltersCardsValidator } from '#validators/filter_validator'
import ValidationException from '#exceptions/validation_exception'

@inject()
export default class FiltersController {
  constructor(private filterService: FilterService) {}

  async cards({ request, response }: HttpContext) {
    try {
      const filters = await getResourceFiltersCardsValidator.validate(request.qs())
      const cardFilters = await this.filterService.getCardFilters(filters)
      return response.ok(cardFilters)
    } catch (error) {
      if (error instanceof vineErrors.E_VALIDATION_ERROR) {
        throw new ValidationException(error)
      }
      throw error
    }
  }
}
