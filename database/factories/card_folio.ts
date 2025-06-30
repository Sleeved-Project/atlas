import CardFolio from '#models/card_folio'
import Factory from '@adonisjs/lucid/factories'
import { v4 as uuidv4 } from 'uuid'
import { CardFactory } from './card.js'
import { FolioFactory } from './folio.js'

export const CardFolioFactory = Factory.define(CardFolio, ({ faker }) => {
  return {
    id: uuidv4(),
    cardId: `base1-1`,
    folioId: uuidv4(),
    occurrence: faker.number.int({ min: 1, max: 10 }),
  }
})
  .relation('card', () => CardFactory)
  .relation('folio', () => FolioFactory)
  .build()
