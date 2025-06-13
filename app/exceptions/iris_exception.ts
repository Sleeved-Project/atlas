import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

export class IrisException extends Exception {
  static code = 'E_IRIS_EXCEPTION'

  constructor(message: string = 'Unknown error occured with iris', status: number = 500) {
    super(message, { status })
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

export class IrisConnectionException extends IrisException {
  constructor(message: string = 'Iris service unavailable', detail?: string) {
    const fullMessage = detail ? `${message}: ${detail}` : message
    super(fullMessage, 503)
  }
}

export class IrisNoMatchException extends IrisException {
  constructor(message: string = 'No matching cards found for the scan') {
    super(message, 404)
  }
}
