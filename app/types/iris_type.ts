export interface ScanAnalyseIrisResponse {
  message: string
  cards: ScanAnalyseIrisCard[]
}

export interface ScanAnalyseIrisCard {
  card_hash: string
  card_index: number
  is_similar: boolean
  similarity_percentage: number
  matched_card_id: string
  matched_card_name: string
  top_n_matches: ScanAnalyseIrisCardMatch[]
}

export interface ScanAnalyseIrisCardMatch {
  card_id: string
  card_name: string
  similarity_percentage: number
  hamming_distance: number
}

export interface ScanCardInfoDTO {
  id: string
  similarity: number
}
