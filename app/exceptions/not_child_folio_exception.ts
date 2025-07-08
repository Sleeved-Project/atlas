import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

export default class NotChildFolioException extends Exception {
  static status = 422
  static code = 'E_NOT_CHILD_FOLIO'

  constructor(folioId: string) {
    super(`Folio ${folioId} is not a child folio`)
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
