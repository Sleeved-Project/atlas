import { ScanAnalyseIrisResponse, ScanCardInfoDTO } from '#types/iris_type'

export default class IrisMapper {
  public static scanAnalyseIrisResponseToScanCardInfoDTO(
    scanAnalyseIrisResponse: ScanAnalyseIrisResponse
  ): ScanCardInfoDTO[] {
    return scanAnalyseIrisResponse.cards[0].top_n_matches.map((match) => ({
      id: match.card_id,
      similarity: match.similarity_percentage,
    }))
  }
}
