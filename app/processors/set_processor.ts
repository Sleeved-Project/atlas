import Set from '#models/set'
import CardService from '#services/card_service'
import { BasicSet, BasicSetPaginationOutputDTO } from '#types/set_type'
import { inject } from '@adonisjs/core'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'

@inject()
export default class SetProcessor {
  constructor(private cardService: CardService) {}

  public async processPaginatedSetCardsToBasicSetOuputDTO(
    sets: ModelPaginatorContract<Set>,
    authUserId: string
  ): Promise<BasicSetPaginationOutputDTO> {
    let basicSets: BasicSetPaginationOutputDTO = {
      data: [],
      meta: {
        total: sets.total,
        perPage: sets.perPage,
        currentPage: sets.currentPage,
        lastPage: sets.lastPage,
      },
    }

    for (const set of sets) {
      const cardOccurrence = await this.cardService.getAllCardsOccurencesBySetId(set.id, authUserId)
      const basicSet = set.toJSON() as BasicSet
      basicSet.nbOwned = cardOccurrence.length
      basicSets.data.push(basicSet)
    }

    return basicSets
  }
}
