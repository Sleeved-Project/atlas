export type FolioStatistics = {
  totalCardsCount: number
  cardMarketPrice: string
  tcgPlayerPrice: string
  cardMarketTrending: PriceTrending
  tcgPlayerTrending: PriceTrending
}

export type FolioListStatistics = {
  totalCardsCount: number
  cardMarketPrice: string
  tcgPlayerPrice: string
}

export enum PriceTrending {
  UP = 'up',
  DOWN = 'down',
  EQUAL = 'equal',
}

export type FoliosInfosAndStatisticsList = FoliosInfosAndStatistics[]

export type FoliosInfosAndStatistics = {
  id: string
  name: string
  image: string | null
  statistics: FolioListStatistics
}

export type FoliosDetailsDTO = {
  id: string
  name: string
  image: string | null
  createdAt: string | null
  statistics: FolioStatistics
}
