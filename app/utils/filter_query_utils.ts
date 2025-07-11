import Card from '#models/card'
import CardFolio from '#models/card_folio'
import { cardsFiltersSchema } from '#validators/card_validator'
import { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import { Infer } from '@vinejs/vine/types'

export default class FilterQueryUtils {
  /**
   * Apply card filter on card query.
   */
  static applyCardFilters(
    filters: Infer<typeof cardsFiltersSchema>,
    cardQuery:
      | ModelQueryBuilderContract<typeof Card, Card>
      | ModelQueryBuilderContract<typeof CardFolio, CardFolio>
  ) {
    return cardQuery
      .if(filters.name, (nameQuery) => nameQuery.whereILike('Card.name', `%${filters.name}%`))
      .if(filters.subtypes && filters.subtypes.length > 0, (query) => {
        query
          .join('Card_Subtype', 'Card.id', 'Card_Subtype.card_id')
          .whereIn('Card_Subtype.subtype_id', filters.subtypes ? filters.subtypes : [])
      })
      .if(filters.types && filters.types.length > 0, (query) => {
        query
          .join('Card_Type', 'Card.id', 'Card_Type.card_id')
          .whereIn('Card_Type.type_id', filters.types ? filters.types : [])
      })
      .if(filters.rarities && filters.rarities.length > 0, (query) =>
        query
          .join('Rarity', 'Card.rarity_id', 'Rarity.id')
          .whereIn('Rarity.id', filters.rarities ? filters.rarities : [])
      )
      .if(filters.artists && filters.artists.length > 0, (query) =>
        query
          .join('Artist', 'Card.artist_id', 'Artist.id')
          .whereIn('Artist.id', filters.artists ? filters.artists : [])
      )
  }
}
