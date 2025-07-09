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
        query.whereIn('Rarity.id', filters.rarities ? filters.rarities : [])
      )
      .if(filters.artists && filters.artists.length > 0, (query) =>
        query.whereIn('Artist.id', filters.artists ? filters.artists : [])
      )
      .orderBy('Set.release_date', 'asc')
      .orderBy(
        db.raw('CAST(NULLIF(REGEXP_REPLACE(Card.number, "[^0-9]", ""), "") AS UNSIGNED)'),
        'asc'
      )
      .paginate(filters.page, filters.limit)
  }

  public async getAllCardsOccurencesBySetId(setId: string, authUserId: string): Promise<Card[]> {
    return await Card.query()
      .join('Set', 'Card.set_id', 'Set.id')
      .join('Rarity', 'Card.rarity_id', 'Rarity.id')
      .join('Artist', 'Card.artist_id', 'Artist.id')
      .join('Card_Folio', 'Card.id', 'Card_Folio.card_id')
      .join('Folio', (join) => {
        join
          .on('Card_Folio.folio_id', '=', 'Folio.id')
          .andOnVal('Folio.is_root', '=', true)
          .andOnVal('Folio.user_id', '=', authUserId)
      })
      .where('Card.set_id', setId)
      .andWhere('Card_Folio.occurrence', '>', 0)
      .select(
        'Card.id',
        db.raw('CASE WHEN Card_Folio.occurrence > 0 THEN true ELSE false END as isOwned')
      )
  }

  public async getAllCardsBySetIdAndPaginate(
    filters: Infer<typeof getAllCardsFiltersValidator>,
    setId: string
  ): Promise<ModelPaginatorContract<Card>> {
    return await Card.query()
      .join('Set', 'Card.set_id', 'Set.id')
      .select('Card.id', 'Card.image_small')
      .join('Rarity', 'Card.rarity_id', 'Rarity.id')
      .join('Artist', 'Card.artist_id', 'Artist.id')
      .where('Card.set_id', setId)
      .select('Card.id', 'Card.image_small')
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

  public async getCardIdById(id: string): Promise<Card> {
    return await Card.query().select('id').where('id', id).firstOrFail()
  }

  public async getCardBasesByIdAndUserId(id: string, userId: string): Promise<Card> {
    return await Card.query()
      .preload('set', (setQuery) => {
        setQuery.select('id', 'name', 'image_symbol')
      })
      .preload('cardFolios', (cardFolioQuery) => {
        cardFolioQuery
          .leftJoin('Folio', (folioQuery) => {
            folioQuery.on('Folio.id', 'Card_Folio.folio_id')
          })
          .select('occurrence')
          .where('Folio.user_id', userId)
          .andWhere('Folio.is_root', true)
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

  public async getAllMainSetCardPricesAndOccurrenceByDaysBefore(
    setId: string,
    daysBefore: number
  ): Promise<Card[]> {
    return await Card.query()
      .join('Set', 'Card.set_id', 'Set.id')
      .where('Card.set_id', setId)
      .preload('cardMarketPrices', (cardMarketPricesQuery) => {
        cardMarketPricesQuery
          .select('id', 'trendPrice', 'reverseHoloTrend')
          .where('updated_at', '>', db.raw('NOW() - INTERVAL ? DAY', daysBefore))
      })
      .preload('tcgPlayerReportings', (tcgPlayerReportings) => {
        tcgPlayerReportings
          .select('id', 'url')
          .where('updated_at', '>', db.raw('NOW() - INTERVAL ? DAY', daysBefore))
          .preload('tcgPlayerPrices', (tcgPlayerPricesQuery) => {
            tcgPlayerPricesQuery.select('id', 'type', 'market')
          })
      })
      .select('Card.id')
  }
}
