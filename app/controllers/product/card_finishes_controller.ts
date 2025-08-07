import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import CardFinishService from '#services/card_finish_service'

@inject()
export default class CardFinishesController {
  constructor(private cardFinishService: CardFinishService) {}

  async index({ response }: HttpContext) {
    try {
      const cardFinishes = await this.cardFinishService.getAllCardFinishes()
      return response.ok(cardFinishes)
    } catch (error) {
      throw error
    }
  }
}
