import Subtype from '#models/subtypes'
import Factory from '@adonisjs/lucid/factories'

export const SubtypeFactory = Factory.define(Subtype, ({ faker }) => {
  return {
    label: faker.lorem.word(10),
  }
}).build()
