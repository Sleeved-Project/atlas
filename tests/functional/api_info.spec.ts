import { test } from '@japa/runner'

test('API Root V1 Atlas', async ({ client }) => {
  const response = await client.get('/api/v1')

  response.assertStatus(200)
  response.assertBodyContains({
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
})
