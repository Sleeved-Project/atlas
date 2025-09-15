import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

export class StripeException extends Exception {
  static code = 'E_STRIPE_EXCEPTION'

  constructor(message: string = 'Unknown error occured with Stripe', status: number = 500) {
    super(message, { status })
  }

  async handle(error: this, ctx: HttpContext) {
    console.error(error)
    ctx.response.status(error.status).send({
      code: error.code,
      message: error.message,
    })
  }
}
