import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

export default class PaymentIntentDuplicateException extends Exception {
  static status = 403
  static code = 'E_PAYMENT_INTENT_DUPLICATE'

  constructor(adId: string) {
    super(`Payment intent already exists for ad ${adId}`)
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
