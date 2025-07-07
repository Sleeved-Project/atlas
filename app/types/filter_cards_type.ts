import Artist from '#models/artist'
import Rarity from '#models/rarity'
import Subtype from '#models/subtypes'
import Type from '#models/type'

export interface FilterCardsOutputDTO {
  artists: Artist[]
  rarities: Rarity[]
  subtypes: Subtype[]
  types: Type[]
}
