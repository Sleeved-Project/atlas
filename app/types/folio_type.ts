export type FolioStatistics = {
  totalCardsCount: number
  cardMarketPrice: string
  tcgPlayerPrice: string
  cardMarketTrending: string
  tcgPlayerTrending: string
}

export enum PriceTrending {
  UP = 'up',
  DOWN = 'down',
  EQUAL = 'equal',
}
