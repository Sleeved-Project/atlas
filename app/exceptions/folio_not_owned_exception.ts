import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

export default class FolioNotOwnedException extends Exception {
  static status = 403
  static code = 'E_FOLIO_NOT_OWNED'

  constructor(folioId: string) {
    super(`Folio ${folioId} is not owned by the user`)
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
