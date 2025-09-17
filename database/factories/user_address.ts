import Factory from '@adonisjs/lucid/factories'
import UserAddress from '#models/user_address'
import { AddressFactory } from './address.js'
import { UserFactory } from './user.js'

export const UserAddressFactory = Factory.define(UserAddress, async () => {
  return {
    isMain: false,
  }
})
  .relation('user', () => UserFactory)
  .relation('address', () => AddressFactory)
  .build()
