import type { HttpContext } from '@adonisjs/core/http'

export default class RootController {
  /**
   * Display the root information
   */
  async handle({ response }: HttpContext) {
    return response.status(200).json({
      name: 'Sleeved Atlas API',
      description: 'Core REST API service for the Sleeved trading card platform',
      versions: [
        {
          version: 'v1',
          url: '/api/v1',
          status: 'current',
        },
        // Future versions can be added here
      ],
      status: 'WIP',
      documentation:
        'https://sleeved.atlassian.net/wiki/spaces/SleevedConception/pages/18382849/Fiche+technique+Atlas+-+API+g+n+rale',
    })
  }
}
