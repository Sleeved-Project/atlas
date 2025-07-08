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

export interface BasicSetPaginationOutputDTO {
  data: BasicSet[]
  meta: {
    total: number
    perPage: number
    currentPage: number
    lastPage: number
  }
}

export interface SetStatisticsOutputDTO extends BasicSet {
  statistics: SetStatistics
}

export enum SetCardPriceTrending {
  UP = 'up',
  DOWN = 'down',
  EQUAL = 'equal',
}
