import { inject } from '@adonisjs/core'
import CardFolioService from '#services/card_folio_service'
import type { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import Card from '#models/card'
import { CardsWithIsOwnedOutputDTO } from '#types/card_dto_type'
import { PaginatedResponse } from '#types/paginate_dto_type'

@inject()
export default class CardProcessor {
  constructor(private cardFolioService: CardFolioService) {}

  /**
   * Process cards with ownership information.
   */
  public async processCardsWithOwnership(
    paginatedCards: ModelPaginatorContract<Card>,
    userId: string
  ): Promise<PaginatedResponse<CardsWithIsOwnedOutputDTO>> {
    const mainFolioCardIds = await this.cardFolioService.getAllCardsIdsFromMainFolio(userId)
    const ownedCardIdsSet = new Set(mainFolioCardIds.map((cardFolio) => cardFolio.cardId))

    const data: CardsWithIsOwnedOutputDTO[] = paginatedCards.all().map((card) => ({
      id: card.id,
      imageSmall: card.imageSmall,
      isOwned: ownedCardIdsSet.has(card.id),
    }))

    return {
      meta: paginatedCards.getMeta(),
      data,
    }
  }
}
