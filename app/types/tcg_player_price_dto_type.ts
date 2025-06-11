export type TcgPlayerPriceDTO = {
  id: number
  type: string
  market: string | null
}

export type TcgPlayerReportingDTO = {
  id: number
  url: string | null
  tcgPlayerPrices: Array<TcgPlayerPriceDTO>
}
