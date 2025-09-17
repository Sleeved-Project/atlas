import Factory from '@adonisjs/lucid/factories'
import Address from '#models/address'

export const AddressFactory = Factory.define(Address, async ({ faker }) => {
  return {
    road: faker.location.street(),
    additionalInfo: faker.datatype.boolean() ? faker.location.secondaryAddress() : null,
    zipcode: faker.location.zipCode(),
    city: faker.location.city(),
    country: faker.location.country(),
    countrycode: faker.location.countryCode(),
  }
}).build()
