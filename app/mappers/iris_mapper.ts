import { ScanAnalyseIrisResponse, ScanCardInfoDTO, GradingIrisResponse } from '#types/iris_type'
import { generateDescription } from '#utils/grading_utils'

export default class IrisMapper {
  public static scanAnalyseIrisResponseToScanCardInfoDTO(
    scanAnalyseIrisResponse: ScanAnalyseIrisResponse
  ): ScanCardInfoDTO[] {
    return scanAnalyseIrisResponse.cards[0].top_n_matches.map((match) => ({
      id: match.card_id,
      similarity: match.similarity_percentage,
    }))
  }

  public static gradingIrisResponseToDTO(gradingIrisResponse: GradingIrisResponse) {
    return gradingIrisResponse.cards.map((card) => {
      const averageScore = card.average_card_score
      return {
        averageScore,
        label: generateDescription(averageScore),
        topClass: card.top_class_matchs[0]?.card_class ?? null,
        confidence: card.top_class_matchs[0]?.confidence ?? null,
        details: {
          surface: card.surface_score,
          contour: card.contour_score,
          corner: card.corner_score,
          center: card.center_score,
        },
      }
    })
  }
}
