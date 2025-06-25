import Folio from '#models/folio'
import Factory from '@adonisjs/lucid/factories'

export const FolioFactory = Factory.define(Folio, ({ faker }) => {
  return {
    id: faker.string.uuid(),
    name: faker.commerce.productName(),
    image: faker.image.url(),
    isRoot: false,
    userId: faker.string.uuid(),
  }
}).build()
