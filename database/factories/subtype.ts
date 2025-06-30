import Subtype from '#models/subtypes'
import Factory from '@adonisjs/lucid/factories'

export const SubtypeFactory = Factory.define(Subtype, () => {
  return {
    id: 1,
    label: `Basic`,
  }
}).build()
