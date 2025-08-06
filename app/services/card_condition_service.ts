import CardCondition from '#models/card_condition'

export default class CardConditionService {
  public async getAllCardConditions(): Promise<CardCondition[]> {
    return CardCondition.query().orderBy('id', 'asc')
  }
}
