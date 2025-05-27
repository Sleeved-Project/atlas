import { test } from '@japa/runner'

test('API v1 root endpoint returns correct information', async ({ client }) => {
  const response = await client.get('/api/v1')

  response.assertStatus(200)
  response.assertBodyContains({
    name: 'api boilerplate',
    description: 'V1 of basic AdonisJS v6 API boilerplate with TypeScript',
  })
})
