import type { HttpContext } from '@adonisjs/core/http'

export default class RootController {
  /**
   * Display the root information
   */
  async handle({ response }: HttpContext) {
    return response.status(200).json({
      name: 'api boilerplate',
      description: 'Basic AdonisJS v6 API boilerplate with TypeScript',
      versions: [
        { version: 'v1', url: '/api/v1', status: 'current' },
        // Future versions can be added here
      ],
      status: 'WIP',
      documentation: 'https://sleeved.atlassian.net/wiki/x/DOC',
    })
  }
}
