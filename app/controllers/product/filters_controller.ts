import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import ArtistService from '#services/artist_service'
import RarityService from '#services/rarity_service'
import SubtypeService from '#services/subtype_service'
import TypeService from '#services/type_service'
import SetService from '#services/set_service'
import { FilterCardsResponse } from '#types/filter_cards_type'

@inject()
export default class FiltersController {
  constructor(
    private artistService: ArtistService,
    private rarityService: RarityService,
    private subtypeService: SubtypeService,
    private typeService: TypeService,
    private setService: SetService
  ) {}

  async cards({ response }: HttpContext): Promise<void> {
    const [artists, raritys, subtypes, types, sets] = await Promise.all([
      this.artistService.getAllArtists(),
      this.rarityService.getAllRarities(),
      this.subtypeService.getAllSubtypes(),
      this.typeService.getAllTypes(),
      this.setService.getAllSets(),
    ])

    const cardFilters: FilterCardsResponse = {
      artists,
      raritys,
      subtypes,
      types,
      sets,
    }

    return response.ok(cardFilters)
  }
}
