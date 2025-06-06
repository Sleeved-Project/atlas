import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Artist from '#models/artist'
import Rarity from '#models/rarity'
import Legality from '#models/legality'
import Set from '#models/set'

export default class Card extends BaseModel {
  /**
   * The table associated with the model.
   */
  static table = 'Card'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare supertype: string

  @column()
  declare level: string | null

  @column()
  declare hp: string | null

  @column()
  declare evolvesFrom: string | null

  @column()
  declare evolvesTo: string | null

  @column()
  declare convertedRetreatCost: number

  @column()
  declare number: string

  @column()
  declare imageLarge: string

  @column()
  declare imageSmall: string

  @column()
  declare flavorText: string | null

  @column()
  declare nationalPokedexNumbers: string | null

  @column()
  declare artistId: number

  @column()
  declare rarityId: number

  @column()
  declare setId: string

  @column()
  declare legalityId: number

  @belongsTo(() => Artist)
  declare artist: BelongsTo<typeof Artist>

  @belongsTo(() => Rarity)
  declare rarity: BelongsTo<typeof Rarity>

  @belongsTo(() => Legality)
  declare legality: BelongsTo<typeof Legality>

  @belongsTo(() => Set)
  declare set: BelongsTo<typeof Set>
}
