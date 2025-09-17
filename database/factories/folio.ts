import Folio from '#models/folio'
import Factory from '@adonisjs/lucid/factories'
import { UserFactory } from './user.js'

export const FolioFactory = Factory.define(Folio, async ({ faker }) => {
  return {
    name: faker.commerce.productName(),
    image: faker.image.url(),
    isRoot: false,
  }
})
  .relation('user', () => UserFactory)
  .build()
