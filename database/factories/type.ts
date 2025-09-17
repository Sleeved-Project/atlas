import Type from '#models/type'
import Factory from '@adonisjs/lucid/factories'

export const TypeFactory = Factory.define(Type, ({ faker }) => {
  return {
    label: faker.lorem.word(10),
  }
}).build()
