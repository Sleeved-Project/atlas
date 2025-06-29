export type FolioStatistics = {
  totalCardsCount: number
  cardMarketPrice: string
  tcgPlayerPrice: string
  cardMarketTrending: PriceTrending
  tcgPlayerTrending: PriceTrending
}

export enum PriceTrending {
  UP = 'up',
  DOWN = 'down',
  EQUAL = 'equal',
}
