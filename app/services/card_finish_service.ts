import CardFinish from '#models/card_finish'

export default class CardFinishService {
  public async getAllCardFinishes(): Promise<CardFinish[]> {
    return CardFinish.query().orderBy('id', 'asc')
  }

  public async getFinishById(id: number): Promise<CardFinish> {
    return CardFinish.findOrFail(id)
  }
}
