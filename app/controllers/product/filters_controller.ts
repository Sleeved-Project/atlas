import { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core/container'
import { errors as vineErrors } from '@vinejs/vine'
import { getResourceFiltersCardsValidator } from '#validators/filter_validator'
import FilterService from '#services/filter_service'
import ValidationException from '#exceptions/validation_exception'

@inject()
export default class FiltersController {
  constructor(private filterService: FilterService) {}

  async cards({ request, response }: HttpContext) {
    try {
      const { types } = await getResourceFiltersCardsValidator.validate(request.qs())

      const filters = await this.filterService.getCardFilters({ types })
      return response.ok(filters)
    } catch (error) {
      if (error instanceof vineErrors.E_VALIDATION_ERROR) {
        throw new ValidationException(error)
      }
      throw error
    }
  }

  async available({ response }: HttpContext) {
    const availableFilters = this.filterService.getAvailableFilterTypes()
    return response.ok({ filters: availableFilters })
  }
}
