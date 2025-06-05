import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'
import { errors as vineErrors } from '@vinejs/vine'

export default class ValidationException extends Exception {
  static status = 422
  static code = 'E_VALIDATION_ERROR'

  constructor(public validationErrors: InstanceType<typeof vineErrors.E_VALIDATION_ERROR>) {
    super('Validation failed')
  }

  async handle(error: this, ctx: HttpContext) {
    ctx.response.status(error.status).send({
      code: error.code,
      message: error.message,
      errors: error.validationErrors.messages,
    })
  }

  async report(error: this, ctx: HttpContext) {
    ctx.logger.error({ err: error }, error.message)
  }
}
