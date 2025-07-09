import FilterMapper from '#mappers/filter_mapper'
import ArtistService from '#services/artist_service'
import RarityService from '#services/rarity_service'
import SubtypeService from '#services/subtype_service'
import TypeService from '#services/type_service'
import { FilterCardsOutputDTO } from '#types/filter_cards_type'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class FiltersController {
  constructor(
    private artistService: ArtistService,
    private rarityService: RarityService,
    private subtypeService: SubtypeService,
    private typeService: TypeService
  ) {}

  async cards({ response }: HttpContext): Promise<void> {
    const [artists, rarities, subtypes, types] = await Promise.all([
      this.artistService.getAllArtists(),
      this.rarityService.getAllRarities(),
      this.subtypeService.getAllSubtypes(),
      this.typeService.getAllTypes(),
    ])

    const filters: FilterCardsOutputDTO = FilterMapper.toNormalizedFilterCardsOutputDTO(
      artists,
      rarities,
      subtypes,
      types
    )

    return response.ok(filters)
  }
}
