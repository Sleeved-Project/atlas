import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

export default class PaymentIntentDuplicateException extends Exception {
  static status = 409
  static code = 'E_PAYMENT_INTENT_DUPLICATE'

  constructor(adId: string) {
    super(`Ad #${adId} is not currently available for purchase`)
  }

  async handle(error: this, ctx: HttpContext) {
    ctx.response.status(error.status).send({
      code: error.code,
      message: error.message,
    })
  }
}
