import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

export default class NotAllowedToPerformException extends Exception {
  static status = 405
  static code = 'E_NOT_ALLOWED_TO_PERFOM_OPERATION'
  static message = 'Not allowed to perform operation'

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
