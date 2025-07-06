import DuplicateEntryException from '#exceptions/duplicate_entry_exception'
import Folio from '#models/folio'
import db from '@adonisjs/lucid/services/db'

export default class FolioService {
  public async createMainFolio(userId: string): Promise<Folio> {
    const existingRootFolio = await Folio.query().where({ userId, isRoot: true }).first()

    if (existingRootFolio) {
      throw new DuplicateEntryException('User already has a root folio')
    }

    return await Folio.create({
      name: 'root',
      image: null,
      isRoot: true,
      userId: userId,
    })
  }

  public async createFolio(userId: string, name: string, image: string): Promise<Folio> {
    return await Folio.create({
      name,
      image,
      isRoot: false,
      userId,
    })
  }

  public async getMainFolioByUserId(userId: string): Promise<Folio> {
    return await Folio.query().where({ userId, isRoot: true }).firstOrFail()
  }

  public async getAllMyChildFolioWithCardPrices(
    userId: string,
    daysBefore: number
  ): Promise<Folio[]> {
    return await Folio.query()
      .preload('cardFolios', (cardFolioQuery) => {
        cardFolioQuery
          .preload('card', (cardQuery) => {
            cardQuery
              .select('id')
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
          .select('Card_Folio.id', 'Card_Folio.occurrence', 'Card_Folio.card_id')
      })
      .select('Folio.id', 'Folio.name', 'Folio.image')
      .where('Folio.user_id', userId)
      .andWhere('Folio.is_root', false)
      .orderBy('Folio.created_at', 'desc')
  }
}
