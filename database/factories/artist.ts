import Artist from '#models/artist'
import Factory from '@adonisjs/lucid/factories'

export const ArtistFactory = Factory.define(Artist, ({ faker }) => {
  return {
    name: faker.person.fullName(),
  }
}).build()

export const PaginatedArtistFactory = Factory.define(Artist, ({ faker }) => {
  return {
    name: faker.person.fullName(),
  }
}).build()
