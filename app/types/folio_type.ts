export type FolioStatisticsOutputDTO = {
  totalCardsCount: number
  cardMarketPrice: string
  tcgPlayerPrice: string
  cardMarketTrending: PriceTrending
  tcgPlayerTrending: PriceTrending
}

export type ChildFolioListStatistics = {
  totalCardsCount: number
  cardMarketPrice: string
  tcgPlayerPrice: string
}

export enum PriceTrending {
  UP = 'up',
  DOWN = 'down',
  EQUAL = 'equal',
}

export type ChildFoliosInfosAndStatisticsListOuputDTO = ChildFoliosInfosAndStatisticsOuputDTO[]

export type ChildFoliosInfosAndStatisticsOuputDTO = {
  id: string
  name: string
  image: string | null
  statistics: ChildFolioListStatistics
}

export type FoliosDetailsOutputDTO = {
  id: string
  name: string
  image: string | null
  createdAt: string | null
  statistics: FolioStatisticsOutputDTO
}
