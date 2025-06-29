import CardFolio from '#models/card_folio'
import { getAllCardsFiltersValidator } from '#validators/card_validator'
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
    filters: Infer<typeof getAllCardsFiltersValidator>,
    mainFolioId: string
  ): Promise<ModelPaginatorContract<CardFolio>> {
    return await CardFolio.query()
      .join('Card', 'Card_Folio.card_id', 'Card.id')
      .join('Set', 'Card.set_id', 'Set.id')
      .where('Card_Folio.folio_id', mainFolioId)
      .preload('card', (cardQuery) => {
        cardQuery.select('id', 'image_small')
      })
      .select('Card_Folio.id', 'Card_Folio.occurrence', 'Card_Folio.card_id', 'Card_Folio.folio_id')
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
}
