import Artist from '#models/artist'
import Factory from '@adonisjs/lucid/factories'

export const ArtistFactory = Factory.define(Artist, ({ faker }) => {
  return {
    name: `${faker.person.firstName()} ${faker.person.lastName()}`,
  }
}).build()
