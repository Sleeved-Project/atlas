import Card from '#models/card'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'

export default class CardService {
  public async getAllCards(page: number, limit: number): Promise<ModelPaginatorContract<Card>> {
    return await Card.query().paginate(page, limit)
  }
}
