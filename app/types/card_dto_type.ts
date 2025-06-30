import { CardMarketPriceDTO } from './card_market_price_dto_type.js'
import { TcgPlayerReportingDTO } from './tcg_player_price_dto_type.js'

export type CardPricesOutputDTO = {
  id: string
  cardMarketReporting: {
    id: number
    url: string | null
    cardMarketPrices: Array<CardMarketPriceDTO>
  } | null
  tcgPlayerReporting: TcgPlayerReportingDTO | null
}
export type CardScanResultOutputDTO = {
  id: string
  imageSmall: string
  imageLarge: string
  bestTrendPrice: string
  similarity: number
}

export type CardsWithFolioOccurenceOutputDTO = {
  id: string
  imageSmall: string
  occurrence: number
}
