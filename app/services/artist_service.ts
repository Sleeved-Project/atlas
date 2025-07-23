import Artist from '#models/artist'
import { getAllFiltersValidator } from '#validators/filter_validator'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import { Infer } from '@vinejs/vine/types'

export default class ArtistService {
  public async getAllArtists(
    filters: Infer<typeof getAllFiltersValidator>
  ): Promise<ModelPaginatorContract<Artist>> {
    return await Artist.query()
      .if(filters.artists.name, (query) => query.whereILike('name', `%${filters.artists.name}%`))
      .orderBy('name', 'asc')
      .paginate(filters.artists.page, filters.artists.limit)
  }
}
