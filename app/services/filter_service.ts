import Artist from '#models/artist'
import Rarity from '#models/rarity'
import Subtype from '#models/subtypes'
import Type from '#models/type'
import Set from '#models/set'
import { getResourceFiltersCardsValidator } from '#validators/filter_validator'
import { inject } from '@adonisjs/core/container'
import { Infer } from '@vinejs/vine/types'
import InvalidFilterException from '#exceptions/invalid_filter_exception'

const FILTER_CONTEXTS = {
  cards: {
    Artist: { model: Artist, orderBy: 'name', columns: ['id', 'name'] },
    Rarity: { model: Rarity, orderBy: 'label', columns: ['id', 'label'] },
    Subtype: { model: Subtype, orderBy: 'label', columns: ['id', 'label'] },
    Type: { model: Type, orderBy: 'label', columns: ['id', 'label'] },
    Set: { model: Set, orderBy: 'name', columns: ['id', 'name'] },
  },
} as const

type FilterContext = keyof typeof FILTER_CONTEXTS

@inject()
export default class FilterService {
  public async getCardFilters(
    filters: Infer<typeof getResourceFiltersCardsValidator>
  ): Promise<Record<string, any>> {
    return this.getFilters('cards', filters)
  }

  private async getFilters(
    context: FilterContext,
    filters: { types?: string[] }
  ): Promise<Record<string, any>> {
    const result: Record<string, any> = {}
    const contextConfig = FILTER_CONTEXTS[context]
    const allFilterTypes = Object.keys(contextConfig).map((name) => name.toLowerCase())
    const { types = allFilterTypes } = filters

    await Promise.all(
      types.map(async (type: string) => {
        const modelName = type.charAt(0).toUpperCase() + type.slice(1)
        const config = contextConfig[modelName as keyof typeof contextConfig]

        if (!config) {
          const availableTypes = Object.keys(contextConfig).map((name) => name.toLowerCase())
          throw new InvalidFilterException(type, availableTypes)
        }

        const data = await config.model
          .query()
          .select(...config.columns)
          .orderBy(config.orderBy, 'asc')

        result[`${type}s`] = data
      })
    )

    return result
  }
}
