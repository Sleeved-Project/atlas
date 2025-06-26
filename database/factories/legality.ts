import Legality from '#models/legality'
import Factory from '@adonisjs/lucid/factories'

export const LegalityFactory = Factory.define(Legality, () => {
  return {
    id: 1,
    standard: `Legal`,
    expanded: `Legal`,
    unlimited: `Legal`,
  }
}).build()
