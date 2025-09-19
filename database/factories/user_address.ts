// database/factories/ad.ts
import UserAddress from '#models/user_address'
import Factory from '@adonisjs/lucid/factories'

export const UserAddressFactory = Factory.define(UserAddress, ({ faker }) => {
  return {
    id: faker.string.uuid(),
    isMain: faker.datatype.boolean(),
    userId: faker.string.uuid(),
    addressId: faker.string.uuid(),
  }
}).build()
