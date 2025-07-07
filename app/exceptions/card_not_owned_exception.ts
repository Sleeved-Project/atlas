import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

export default class CardNotOwnedException extends Exception {
  static status = 403
  static code = 'E_CARD_NOT_OWNED'

  constructor(cardId: string) {
    super(`Card ${cardId} not found in your main folio`)
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
