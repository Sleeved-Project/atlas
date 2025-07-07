import Artist from '#models/artist'
import Rarity from '#models/rarity'
import Subtype from '#models/subtypes'
import Type from '#models/type'

export interface FilterCardsResponse {
  artists: Artist[]
  raritys: Rarity[]
  subtypes: Subtype[]
  types: Type[]
}
