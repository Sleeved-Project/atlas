import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'
import { errors as lucidErrors } from '@adonisjs/lucid'

export default class NotFoundException extends Exception {
  static status = 404
  static code = 'E_UNAUTHORIZED'

  constructor(error: InstanceType<typeof lucidErrors.E_ROW_NOT_FOUND>) {
    const message = `${error.model?.name || 'Row'} not found`
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
