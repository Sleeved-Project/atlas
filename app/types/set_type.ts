export type SetStatistics = {
  totalCardsCount: number
  cardMarketPrice: string
  tcgPlayerPrice: string
  cardMarketTrending: SetCardPriceTrending
  tcgPlayerTrending: SetCardPriceTrending
}

export enum SetCardPriceTrending {
  UP = 'up',
  DOWN = 'down',
  EQUAL = 'equal',
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

export interface SetDetailType extends BasicSet {
  statistics: {
    totalCardsCount: number
    cardMarketPrice: string
    tcgPlayerPrice: string
    cardMarketTrending: SetCardPriceTrending
    tcgPlayerTrending: SetCardPriceTrending
  }
}
