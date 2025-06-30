import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import { v4 as uuidv4 } from 'uuid'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

import Folio from './folio.js'
import Card from './card.js'
import { DateTime } from 'luxon'

export default class CardFolio extends BaseModel {
  /**
   * The table associated with the model.
   */
  static table = 'Card_Folio'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare occurrence: number

  @column.dateTime({ columnName: 'created_at', autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ columnName: 'updated_at', autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column({ columnName: 'folio_id', serializeAs: null })
  declare folioId: string

  @column({ columnName: 'card_id', serializeAs: null })
  declare cardId: string

  @belongsTo(() => Folio)
  declare folio: BelongsTo<typeof Folio>

  @belongsTo(() => Card)
  declare card: BelongsTo<typeof Card>

  @beforeCreate()
  static assignUuid(cardFolio: CardFolio) {
    cardFolio.id = uuidv4()
  }
}
