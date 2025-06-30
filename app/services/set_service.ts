import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import { Infer } from '@vinejs/vine/types'
import Set from '#models/set'
import { getAllSetsFiltersValidator } from '#validators/set_validator'

export default class SetService {
  public async getAllSets(
    filters: Infer<typeof getAllSetsFiltersValidator>
  ): Promise<ModelPaginatorContract<Set>> {
    return await Set.query()
      .select('Set.id', 'Set.image_symbol', 'Set.image_logo')
      .if(filters.name, (query) => query.whereILike('Set.name', `%${filters.name}%`))
      .orderBy('Set.release_date', 'asc')
      .paginate(filters.page, filters.limit)
  }

  public async getSetDetailById(id: string): Promise<Set> {
    return await Set.query().where('id', id).firstOrFail()
  }
}
