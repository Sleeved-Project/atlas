// database/factories/ad.ts
import Address from '#models/address'
import Factory from '@adonisjs/lucid/factories'

export const AddressFactory = Factory.define(Address, ({ faker }) => {
  return {
    id: faker.string.uuid(),
    road: faker.location.street(),
    additionalInfo: null,
    zipcode: faker.location.zipCode(),
    city: faker.location.city(),
    country: faker.location.country(),
    countrycode: faker.location.countryCode(),
  }
}).build()
