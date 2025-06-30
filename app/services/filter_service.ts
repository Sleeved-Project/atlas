import Artist from '#models/artist'
import Rarity from '#models/rarity'
import Subtype from '#models/subtypes'
import Type from '#models/type'
import { getResourceFiltersCardsValidator } from '#validators/filter_validator'
import { inject } from '@adonisjs/core/container'
import { Infer } from '@vinejs/vine/types'
import InvalidFilterException from '#exceptions/invalid_filter_exception'

// Filters models configuration with their instances
const FILTER_MODELS = {
  Artist: { model: Artist, orderBy: 'name' },
  Rarity: { model: Rarity, orderBy: 'label' },
  Subtype: { model: Subtype, orderBy: 'label' },
  Type: { model: Type, orderBy: 'label' },
} as const

@inject()
export default class FilterService {
  /**
   * Return the available filter types with their model and result key
   */
  public getAvailableFilterTypes(): { type: string; resultKey: string; model: string }[] {
    return Object.keys(FILTER_MODELS).map((modelName) => ({
      type: modelName.toLowerCase(),
      resultKey: `${modelName.toLowerCase()}s`,
      model: modelName,
    }))
  }

  /**
   * Get filters for cards based on the provided types
   * @param filterData - The filter data containing types
   */
  public async getCardFilters(filterData: Infer<typeof getResourceFiltersCardsValidator>) {
    const result: Record<string, any> = {}
    const { types = [] } = filterData

    await Promise.all(
      types.map(async (type: string) => {
        const modelName = this.getModelNameFromType(type)
        const config = FILTER_MODELS[modelName as keyof typeof FILTER_MODELS]

        if (!config) {
          const availableTypes = Object.keys(FILTER_MODELS).map((name) => name.toLowerCase())
          throw new InvalidFilterException(type, availableTypes)
        }

        result[`${type}s`] = await config.model.query().orderBy(config.orderBy, 'asc')
      })
    )

    return result
  }

  private getModelNameFromType(type: string): string {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }
}
