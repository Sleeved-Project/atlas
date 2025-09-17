import CardFolio from '#models/card_folio'
import Factory from '@adonisjs/lucid/factories'
import { CardFactory } from './card.js'
import { FolioFactory } from './folio.js'

export const CardFolioFactory = Factory.define(CardFolio, ({ faker }) => {
  return {
    occurrence: faker.number.int({ min: 1, max: 10 }),
  }
})
  .relation('card', () => CardFactory)
  .relation('folio', () => FolioFactory)
  .build()
