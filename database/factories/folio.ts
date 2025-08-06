import Folio from '#models/folio'
import { TEST_AUTH_USER_ID } from '#tests/mocks/auth_service_mock'
import Factory from '@adonisjs/lucid/factories'

export const FolioFactory = Factory.define(Folio, async ({ faker }) => {
  return {
    id: faker.string.uuid(),
    name: faker.commerce.productName(),
    image: faker.image.url(),
    isRoot: false,
    userId: TEST_AUTH_USER_ID,
  }
}).build()
