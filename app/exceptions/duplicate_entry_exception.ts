import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

export default class DuplicateEntryException extends Exception {
  static status = 409
  static code = 'E_DUPLICATE_ENTRY'

  constructor(message: string = 'Duplicate entry found') {
    super(message)
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
