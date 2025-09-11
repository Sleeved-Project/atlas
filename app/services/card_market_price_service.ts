import CardMarketPrice from '#models/card_market_price'

export default class CardMarketPriceService {
  public async getLastCardMarketPricesByCardId(cardId: string): Promise<CardMarketPrice | null> {
    return await CardMarketPrice.query()
      .where('card_id', cardId)
      .orderBy('updated_at', 'desc')
      .select('id', 'trend_price', 'reverse_holo_trend', 'updated_at')
      .first()
  }
}
