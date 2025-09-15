import { inject } from '@adonisjs/core'
import { ScanCardInfoDTO } from '#types/iris_type'
import CardMapper from '#mappers/card_mapper'
import CardService from '#services/card_service'

@inject()
export default class IdentificationProcessor {
  constructor(private cardService: CardService) {}

  /**
   * Process cards with ownership information.
   */
  public async processIdentification(cardIdentificationResult: ScanCardInfoDTO) {
    if (cardIdentificationResult.id === 'back-side') {
      return CardMapper.toBackSideCardIdentifyResultOutputDTO(cardIdentificationResult)
    }

    const cardDetails = await this.cardService.getMinimalCardDetailById(cardIdentificationResult.id)

    return CardMapper.toCardScanIdentifyResultOutputDTO(cardDetails, cardIdentificationResult)
  }
}
