import TcgPlayerReporting from '#models/tcg_player_reporting'
import { CardMarketPriceDTO } from './card_market_price_dto_type.js'

export type CardPricesOutputDTO = {
  id: string
  cardMarketReporting: {
    id: number
    url: string | null
    cardMarketPrices: Array<CardMarketPriceDTO>
  } | null
  tcgPlayerReporting: TcgPlayerReporting | null
}
