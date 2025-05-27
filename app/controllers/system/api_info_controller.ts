import type { HttpContext } from '@adonisjs/core/http'

export default class ApiInfoController {
  /**
   * Display API information and version details
   */
  async handle({ response }: HttpContext) {
    return response.status(200).json({
      name: 'api boilerplate',
      description: 'V1 of basic AdonisJS v6 API boilerplate with TypeScript',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      status: 'WIP',
    })
  }
}
