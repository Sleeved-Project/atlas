import Subtype from '#models/subtypes'
import Factory from '@adonisjs/lucid/factories'

export const SubtypeFactory = Factory.define(Subtype, ({ faker }) => {
  return {
    label: faker.helpers.arrayElement([
      'Basic',
      'Stage 1',
      'Stage 2',
      'LEGEND',
      'MEGA',
      'GX',
      'V',
      'VMAX',
      'VSTAR',
      'Item',
      'Supporter',
      'Stadium',
      'Tool',
      'Special',
      'BREAK',
    ]),
  }
}).build()
