import CardFolio from '#models/card_folio'
import { getAllMainFolioCardsFiltersValidator } from '#validators/card_validator'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import { Infer } from '@vinejs/vine/types'
import db from '@adonisjs/lucid/services/db'

export default class CardFolioService {
  public async createCardFolio(cardId: string, folioId: string): Promise<CardFolio> {
    return await CardFolio.create({
      occurrence: 1,
      cardId,
      folioId,
    })
  }

  public async getAllMainFolioCards(
    filters: Infer<typeof getAllMainFolioCardsFiltersValidator>,
    mainFolioId: string
  ): Promise<ModelPaginatorContract<CardFolio>> {
    return await CardFolio.query()
      .join('Card', 'Card_Folio.card_id', 'Card.id')
      .join('Set', 'Card.set_id', 'Set.id')
      .join('Rarity', 'Card.rarity_id', 'Rarity.id')
      .join('Artist', 'Card.artist_id', 'Artist.id')
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
      .where('Card_Folio.folio_id', mainFolioId)
      .preload('card', (cardQuery) => {
        cardQuery.select('id', 'image_small')
      })
      .select('Card_Folio.id', 'Card_Folio.occurrence', 'Card_Folio.card_id', 'Card_Folio.folio_id')
      .if(filters.name, (query) => query.whereILike('Card.name', `%${filters.name}%`))
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

  public async getAllMainFolioCardPricesAndOccurrenceByDaysBefore(
    mainFolioId: string,
    daysBefore: number
  ): Promise<CardFolio[]> {
    return await CardFolio.query()
      .join('Card', 'Card_Folio.card_id', 'Card.id')
      .where('Card_Folio.folio_id', mainFolioId)
      .preload('card', (cardQuery) => {
        cardQuery
          .select('id', 'image_small')
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
      })
      .select('Card_Folio.id', 'Card_Folio.occurrence', 'Card_Folio.card_id', 'Card_Folio.folio_id')
  }

  public async updateCardFolioOccurrence(
    cardId: string,
    folioId: string,
    occurrence: number
  ): Promise<CardFolio> {
    const cardFolio = await CardFolio.findByOrFail({
      cardId,
      folioId,
    })
    return await cardFolio.merge({ occurrence }).save()
  }

  public async deleteCardFromFolioByCardIdAndFolioId(
    cardId: string,
    folioId: string
  ): Promise<void> {
    const cardFolio = await CardFolio.findByOrFail({
      cardId,
      folioId,
    })
    await cardFolio.delete()
  }
}
