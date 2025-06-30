import Artist from '#models/artist'
import Factory from '@adonisjs/lucid/factories'

export const ArtistFactory = Factory.define(Artist, () => {
  return {
    id: 1,
    name: `Artist name`,
  }
}).build()
