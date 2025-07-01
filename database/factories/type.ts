import Type from '#models/type'
import Factory from '@adonisjs/lucid/factories'

export const TypeFactory = Factory.define(Type, () => {
  return {
    id: 1,
    label: `Psy`,
  }
}).build()
