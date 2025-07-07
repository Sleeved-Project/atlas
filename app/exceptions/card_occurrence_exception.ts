import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

export default class InsufficientCardOccurrenceException extends Exception {
  static status = 422
  static code = 'E_INSUFFICIENT_CARD_OCCURRENCE'

  constructor(cardId: string, required: number, available: number) {
    super(
      `Insufficient occurrence for card ${cardId}. Required: ${required}, Available: ${available}`
    )
  }

  async handle(error: this, ctx: HttpContext) {
    ctx.response.status(error.status).send({
      code: error.code,
      message: error.message,
    })
  }

  async report(error: this, ctx: HttpContext) {
    ctx.logger.error({ err: error }, error.message)
  }
}
