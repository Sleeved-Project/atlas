export interface SetStatistics {
  cardMarketPrice: string
  tcgPlayerPrice: string
  cardMarketTrending: SetCardPriceTrending
  tcgPlayerTrending: SetCardPriceTrending
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

export enum SetCardPriceTrending {
  UP = 'up',
  DOWN = 'down',
  EQUAL = 'equal',
}
