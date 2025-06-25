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

      // Default to all card filter types if none specified
      const filterTypes = types || ['rarity', 'subtype', 'artist']

      const filters = await this.filterService.getCardFilters(filterTypes)
      return response.ok(filters)
    } catch (error) {
      if (error instanceof vineErrors.E_VALIDATION_ERROR) {
        throw new ValidationException(error)
      }
      throw error
    }
  }
}
