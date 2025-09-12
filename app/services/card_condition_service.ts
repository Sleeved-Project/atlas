import CardCondition from '#models/card_condition'

export default class CardConditionService {
  public async getAllCardConditions(): Promise<CardCondition[]> {
    return CardCondition.query().select('id', 'label').orderBy('id', 'asc')
  }

  public async getConditionById(id: number): Promise<CardCondition> {
    return CardCondition.findOrFail(id)
  }
}
