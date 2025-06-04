import type { HttpContext } from '@adonisjs/core/http'

export default class ApiInfoController {
  /**
   * Display API information and version details
   */
  async handle({ response }: HttpContext) {
    return response.status(200).json({
      name: 'Atlas API',
      description: 'Atlas is an API that connects Sleeved microservices to each other',
      versions: [
        {
          version: 'v1',
          url: '/api/v1',
          status: 'current',
        },
      ],
      status: 'WIP',
      documentation:
        'https://sleeved.atlassian.net/wiki/spaces/SleevedConception/pages/18382849/Fiche+technique+Atlas+-+API+g+n+rale',
    })
  }
}
