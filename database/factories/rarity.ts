import Rarity from '#models/rarity'
import Factory from '@adonisjs/lucid/factories'

export const RarityFactory = Factory.define(Rarity, () => {
  return {
    id: 1,
    label: `Common`,
  }
}).build()
