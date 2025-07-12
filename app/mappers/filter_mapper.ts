import Artist from '#models/artist'
import Rarity from '#models/rarity'
import Subtype from '#models/subtypes'
import Type from '#models/type'
import {
  FilterCardsOutputDTO,
  FilterItem,
  PaginatedFilterCardsOutputDTO,
} from '#types/filter_cards_type'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'

export default class FilterMapper {
  public static toPaginatedFilterCardsOutputDTO(
    paginatedArtists: ModelPaginatorContract<Artist>,
    rarities: Rarity[],
    subtypes: Subtype[],
    types: Type[]
  ): PaginatedFilterCardsOutputDTO {
    return {
      ...this.toNormalizedFilterCardsOutputDTO(paginatedArtists, rarities, subtypes, types),
      meta: paginatedArtists.getMeta(),
    }
  }

  public static toNormalizedFilterCardsOutputDTO(
    paginatedArtists: ModelPaginatorContract<Artist>,
    rarities: Rarity[],
    subtypes: Subtype[],
    types: Type[]
  ): FilterCardsOutputDTO {
    return {
      artists: this.normalizeArtists(paginatedArtists),
      rarities: this.normalizeRarities(rarities),
      subtypes: this.normalizeSubtypes(subtypes),
      types: this.normalizeTypes(types),
    }
  }

  private static normalizeArtists(paginatedArtists: ModelPaginatorContract<Artist>): FilterItem[] {
    return paginatedArtists.toJSON().data.map((artist) => ({
      id: artist.id,
      value: artist.name,
    }))
  }

  private static normalizeRarities(rarities: Rarity[]): FilterItem[] {
    return rarities.map((rarity) => ({
      id: rarity.id,
      value: rarity.label,
    }))
  }

  private static normalizeSubtypes(subtypes: Subtype[]): FilterItem[] {
    return subtypes.map((subtype) => ({
      id: subtype.id,
      value: subtype.label,
    }))
  }

  private static normalizeTypes(types: Type[]): FilterItem[] {
    return types.map((type) => ({
      id: type.id,
      value: type.label,
    }))
  }
}
