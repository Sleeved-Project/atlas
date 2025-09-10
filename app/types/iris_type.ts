// Interfaces for Iris API responses and DTOs
// -------------------------------
// New interface : scan & analyse
// -------------------------------
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

export interface GradingIrisResponse {
  message: string
  cards: GradingIrisCard[]
}

export interface GradingIrisCard {
  average_card_score: number
  top_class_matchs: GradingIrisClassMatch[]
  surface_score: number
  contour_score: number
  corner_score: number
  center_score: number
}

export interface GradingIrisClassMatch {
  card_class: string
  confidence: number
}
