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
      .join('Rarity', 'Card.rarity_id', 'Rarity.id')
      .join('Artist', 'Card.artist_id', 'Artist.id')
      .select('Card.id', 'Card.image_small')
      .if(filters.name, (query) => query.whereILike('Card.name', `%${filters.name}%`))
      .if(filters.subtype && filters.subtype.length > 0, (query) => {
        query
          .join('Card_Subtype', 'Card.id', 'Card_Subtype.card_id')
          .whereIn('Card_Subtype.subtype_id', filters.subtype ? filters.subtype : [])
      })
      .if(filters.type && filters.type.length > 0, (query) => {
        query
          .join('Card_Type', 'Card.id', 'Card_Type.card_id')
          .whereIn('Card_Type.type_id', filters.type ? filters.type : [])
      })
      .if(filters.rarity && filters.rarity.length > 0, (query) =>
        query.whereIn('Rarity.id', filters.rarity ? filters.rarity : [])
      )
      .if(filters.artist && filters.artist.length > 0, (query) =>
        query.whereIn('Artist.id', filters.artist ? filters.artist : [])
      )
      .orderBy('Set.release_date', 'asc')
      .orderBy(
        db.raw('CAST(NULLIF(REGEXP_REPLACE(Card.number, "[^0-9]", ""), "") AS UNSIGNED)'),
        'asc'
      )
      .paginate(filters.page, filters.limit)
  }

  public async getAllCardsBySetIdAndPaginate(
    filters: Infer<typeof getAllCardsFiltersValidator>,
    setId: string
  ): Promise<ModelPaginatorContract<Card>> {
    return await Card.query()
      .join('Set', 'Card.set_id', 'Set.id')
      .select('Card.id', 'Card.image_small')
      .where('Card.set_id', setId)
      .if(filters.name, (query) => query.whereILike('Card.name', `%${filters.name}%`))
      .orderBy(
        db.raw('CAST(NULLIF(REGEXP_REPLACE(Card.number, "[^0-9]", ""), "") AS UNSIGNED)'),
        'asc'
      )
      .paginate(filters.page, filters.limit)
  }

  public async getAllCardsBySetId(setId: string): Promise<Card[]> {
    return await Card.query()
      .join('Set', 'Card.set_id', 'Set.id')
      .select('Card.id', 'Card.image_small')
      .where('Card.set_id', setId)
      .orderBy('Set.release_date', 'asc')
      .orderBy(
        db.raw('CAST(NULLIF(REGEXP_REPLACE(Card.number, "[^0-9]", ""), "") AS UNSIGNED)'),
        'asc'
      )
  }

  public async getCardBaseById(id: string): Promise<Card> {
    return await Card.query()
      .preload('set', (setQuery) => {
        setQuery.select('id', 'name', 'image_symbol')
      })
      .select('id', 'image_large', 'number', 'set_id')
      .where('id', id)
      .firstOrFail()
  }

  public async getCardDetailById(id: string): Promise<Card> {
    return await Card.query()
      .preload('set', (setQuery) => {
        setQuery.select('id', 'release_date')
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
      .select('id', 'flavor_text', 'set_id', 'rarity_id', 'artist_id')
      .where('id', id)
      .firstOrFail()
  }

  public async getTodayCardPricesById(id: string): Promise<Card> {
    return await Card.query()
      .preload('cardMarketPrices', (cardMarketPricesQuery) => {
        cardMarketPricesQuery
          .select('id', 'trendPrice', 'reverseHoloTrend', 'url')
          .where('updated_at', '>', db.raw('NOW() - INTERVAL 1 DAY'))
      })
      .preload('tcgPlayerReportings', (tcgPlayerReportings) => {
        tcgPlayerReportings
          .select('id', 'url')
          .where('updated_at', '>', db.raw('NOW() - INTERVAL 1 DAY'))
          .preload('tcgPlayerPrices', (tcgPlayerPricesQuery) => {
            tcgPlayerPricesQuery.select('id', 'type', 'market')
          })
      })
      .select('id')
      .where('id', id)
      .firstOrFail()
  }

  public async getCardScanResulInfosById(id: string): Promise<Card> {
    return await Card.query()
      .preload('cardMarketPrices', (cardMarketPricesQuery) => {
        cardMarketPricesQuery
          .select('id', 'trendPrice', 'reverseHoloTrend', 'url')
          .where('updated_at', '>', db.raw('NOW() - INTERVAL 1 DAY'))
      })
      .preload('tcgPlayerReportings', (tcgPlayerReportings) => {
        tcgPlayerReportings
          .select('id', 'url')
          .where('updated_at', '>', db.raw('NOW() - INTERVAL 1 DAY'))
          .preload('tcgPlayerPrices', (tcgPlayerPricesQuery) => {
            tcgPlayerPricesQuery.select('id', 'type', 'market').orderBy('market', 'desc')
          })
      })
      .select('id', 'image_large', 'image_small')
      .where('id', id)
      .firstOrFail()
  }
}
