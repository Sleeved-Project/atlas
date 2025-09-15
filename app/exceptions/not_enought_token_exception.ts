import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

export default class NotEnoughtTokenException extends Exception {
  static status = 403
  static code = 'E_NOT_ENOUGH_TOKEN'
  static message = 'Not enough token to perform operation'

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
