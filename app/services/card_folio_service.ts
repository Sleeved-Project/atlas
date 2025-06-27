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
}
