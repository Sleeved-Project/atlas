import { PriceTrending } from './folio_type.js'

export interface SetStatistics {
  cardMarketPrice: string
  tcgPlayerPrice: string
  cardMarketTrending: PriceTrending
  tcgPlayerTrending: PriceTrending
}

export interface BasicSet {
  id: string
  name: string
  releaseDate?: any
  imageSymbol: string
  imageLogo: string
  nbOwned?: number
  total: number
}

export interface SetStatisticsOutputDTO extends BasicSet {
  statistics: SetStatistics
}
