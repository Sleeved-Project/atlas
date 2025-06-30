import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

export default class InvalidFilterException extends Exception {
  static status = 400
  static code = 'E_INVALID_FILTER_TYPE'

  constructor(filterType: string, availableTypes: string[]) {
    const message = `Invalid filter type: '${filterType}'. Available types: ${availableTypes.join(', ')}`
    super(message)
  }

  async handle(error: this, ctx: HttpContext) {
    ctx.response.status(error.status).send({
      code: error.code,
      message: error.message,
    })
  }
}
