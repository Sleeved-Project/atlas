import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import { Infer } from '@vinejs/vine/types'
import Set from '#models/set'
import { getAllSetsFiltersValidator } from '#validators/set_validator'

export default class SetService {
  public async getAllSets(
    filters: Infer<typeof getAllSetsFiltersValidator>
  ): Promise<ModelPaginatorContract<Set>> {
    return await Set.query()
      .select('id', 'image_symbol', 'image_logo')
      .if(filters.name, (query) => query.whereILike('name', `%${filters.name}%`))
      .orderBy('release_date', 'asc')
      .paginate(filters.page, filters.limit)
  }

  public async getSetDetailById(id: string): Promise<Set> {
    return await Set.query()
      .where('id', id)
      .select('id', 'name', 'release_date', 'image_symbol', 'image_logo', 'total')
      .firstOrFail()
  }
}
