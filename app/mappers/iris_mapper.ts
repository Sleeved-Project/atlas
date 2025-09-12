import { ScanAnalyseIrisResponse, ScanCardInfoDTO } from '#types/iris_type'

export default class IrisMapper {
  public static scanAnalyseIrisResponseToScanCardInfoDTO(
    scanAnalyseIrisResponse: ScanAnalyseIrisResponse
  ): ScanCardInfoDTO[] {
    return scanAnalyseIrisResponse.cards[0].top_n_matches.map((match) => ({
      id: match.card_id,
      similarity: match.similarity_percentage,
      extractedTempImageUrl: scanAnalyseIrisResponse.cards[0].extracted_temp_image_url,
    }))
  }

  public static scanAnalyseIrisResponseToIdentifyDTO(
    scanAnalyseIrisResponse: ScanAnalyseIrisResponse
  ): ScanCardInfoDTO | null {
    if (!scanAnalyseIrisResponse.cards || scanAnalyseIrisResponse.cards.length === 0) {
      return null
    }

    const topMatches = scanAnalyseIrisResponse.cards[0].top_n_matches || []
    if (topMatches.length === 0) {
      return null
    }

    // Take only the best match (the first one already sorted by Iris)
    const bestMatch = topMatches[0]

    return {
      id: bestMatch.card_id,
      similarity: bestMatch.similarity_percentage,
      extractedTempImageUrl: scanAnalyseIrisResponse.cards[0].extracted_temp_image_url,
    }
  }
}
