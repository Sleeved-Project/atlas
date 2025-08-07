import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import CardConditionService from '#services/card_condition_service'

@inject()
export default class CardConditionsController {
  constructor(private cardConditionService: CardConditionService) {}

  async index({ response }: HttpContext) {
    try {
      const cardConditions = await this.cardConditionService.getAllCardConditions()
      return response.ok(cardConditions)
    } catch (error) {
      throw error
    }
  }
}
