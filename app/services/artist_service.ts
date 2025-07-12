import Artist from '#models/artist'
import { getAllArtistFiltersValidator } from '#validators/filter_validator'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import { Infer } from '@vinejs/vine/types'

export default class ArtistService {
  public async getAllArtists(
    filters: Infer<typeof getAllArtistFiltersValidator>
  ): Promise<ModelPaginatorContract<Artist>> {
    return await Artist.query()
      .if(filters.name, (query) => query.whereILike('name', `%${filters.name}%`))
      .orderBy('name', 'asc')
      .paginate(filters.page, filters.limit)
  }
}
