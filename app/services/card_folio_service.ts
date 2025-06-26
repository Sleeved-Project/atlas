import CardFolio from '#models/card_folio'

export default class CardFolioService {
  public async createCardFolio(cardId: string, folioId: string): Promise<CardFolio> {
    return await CardFolio.create({
      occurrence: 1,
      cardId,
      folioId,
    })
  }
}
