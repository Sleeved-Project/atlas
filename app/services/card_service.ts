import Card from '#models/card'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import db from '@adonisjs/lucid/services/db'
import { getAllCardsFiltersValidator } from '#validators/card_validator'
import { Infer } from '@vinejs/vine/types'

export default class CardService {
  public async getAllCards(
    filters: Infer<typeof getAllCardsFiltersValidator>
  ): Promise<ModelPaginatorContract<Card>> {
    return await Card.query()
      .join('Set', 'Card.set_id', 'Set.id')
      .select('Card.id', 'Card.image_small')
      .if(filters.name, (query) => query.whereILike('Card.name', `%${filters.name}%`))
      .orderBy('Set.release_date', 'asc')
      .orderBy(
        db.raw('CAST(NULLIF(REGEXP_REPLACE(Card.number, "[^0-9]", ""), "") AS UNSIGNED)'),
        'asc'
      )
      .paginate(filters.page, filters.limit)
  }

  public async getCardDetailById(id: string): Promise<Card> {
    return await Card.query()
      .preload('set', (setQuery) => {
        setQuery.select('id', 'name', 'release_date', 'image_symbol')
      })
      .preload('rarity', (setQuery) => {
        setQuery.select('id', 'label')
      })
      .preload('artist', (setQuery) => {
        setQuery.select('id', 'name')
      })
      .preload('subtypes', (setQuery) => {
        setQuery.select('id', 'label')
      })
      .select(
        'id',
        'name',
        'image_large',
        'flavor_text',
        'number',
        'set_id',
        'rarity_id',
        'artist_id'
      )
      .where('id', id)
      .firstOrFail()
  }
}
