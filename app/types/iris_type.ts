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
  extracted_temp_image_url: string
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
  extractedTempImageUrl: string
}

// -------------------------------
// Grading interfaces
// -------------------------------
export interface GradingIrisResponse {
  message: string
  grades: GradingIrisGrade[] // tableau de notes
}

export interface GradingIrisGrade {
  average_grade_score: number
  surface_score: number
  contour_score: number
  corner_score: number
  center_score: number
  top_class_matchs: {
    grade_class: string
    confidence: number
  }[]
}

// DTO simplifié pour la sortie
export interface GradingOutputDTO {
  averageScore: number
  details: {
    surface: number
    contour: number
    corner: number
    center: number
  }
  topClassMatches: {
    grade_class: string
    confidence: number
  }[]
  label?: string // Ajouté par le controller
}
