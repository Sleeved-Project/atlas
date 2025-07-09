import Artist from '#models/artist'
import Rarity from '#models/rarity'
import Subtype from '#models/subtypes'
import Type from '#models/type'
import { FilterCardsOutputDTO, FilterItem } from '#types/filter_cards_type'

export default class FilterMapper {
  public static toNormalizedFilterCardsOutputDTO(
    artists: Artist[],
    rarities: Rarity[],
    subtypes: Subtype[],
    types: Type[]
  ): FilterCardsOutputDTO {
    return {
      artists: this.normalizeArtists(artists),
      rarities: this.normalizeRarities(rarities),
      subtypes: this.normalizeSubtypes(subtypes),
      types: this.normalizeTypes(types),
    }
  }

  private static normalizeArtists(artists: Artist[]): FilterItem[] {
    return artists.map((artist) => ({
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
