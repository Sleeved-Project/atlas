import { BaseModel, belongsTo, column, computed, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Artist from '#models/artist'
import Rarity from '#models/rarity'
import Legality from '#models/legality'
import Set from '#models/set'
import Subtype from '#models/subtypes'
import CardMarketPrice from '#models/card_market_price'
import TcgPlayerReporting from '#models/tcg_player_reporting'
import CardFolio from '#models/card_folio'
import Type from '#models/type'

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

  @column({ serializeAs: null })
  declare artistId: number

  @column({ serializeAs: null })
  declare rarityId: number

  @column({ serializeAs: null })
  declare setId: string

  @column({ serializeAs: null })
  declare legalityId: number

  @belongsTo(() => Artist)
  declare artist: BelongsTo<typeof Artist>

  @belongsTo(() => Rarity)
  declare rarity: BelongsTo<typeof Rarity>

  @belongsTo(() => Legality)
  declare legality: BelongsTo<typeof Legality>

  @belongsTo(() => Set)
  declare set: BelongsTo<typeof Set>

  @manyToMany(() => Subtype, {
    pivotTable: 'Card_Subtype',
  })
  declare subtypes: ManyToMany<typeof Subtype>

  @manyToMany(() => Type, {
    pivotTable: 'Card_Type',
  })
  declare types: ManyToMany<typeof Type>

  @hasMany(() => CardMarketPrice, {
    foreignKey: 'cardId',
  })
  declare cardMarketPrices: HasMany<typeof CardMarketPrice>

  @hasMany(() => TcgPlayerReporting, {
    foreignKey: 'cardId',
  })
  declare tcgPlayerReportings: HasMany<typeof TcgPlayerReporting>

  @hasMany(() => CardFolio, {
    foreignKey: 'cardId',
  })
  declare cardFolios: HasMany<typeof CardFolio>

  @computed()
  public get isOwned(): boolean {
    return !!this.$extras.isOwned
  }
}
