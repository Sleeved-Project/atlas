import Set from '#models/set'
import CardService from '#services/card_service'
import { PaginatedResponse } from '#types/paginate_dto_type'
import { BasicSet } from '#types/set_type'
import { inject } from '@adonisjs/core'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'

@inject()
export default class SetProcessor {
  constructor(private cardService: CardService) {}

  public async processPaginatedSetCardsToBasicSetPaginationOutputDTO(
    sets: ModelPaginatorContract<Set>,
    authUserId: string
  ): Promise<PaginatedResponse<BasicSet>> {
    let data: BasicSet[] = []
    for (const set of sets) {
      const cardOccurrence = await this.cardService.getAllCardsOccurencesBySetId(set.id, authUserId)
      const basicSet = set.toJSON() as BasicSet
      basicSet.nbOwned = cardOccurrence.length
      data.push(basicSet)
    }
    return {
      meta: sets.getMeta(),
      data,
    }
  }

  public async processSetDetailCardsOccurencesToBasicSetOutputDTO(
    set: Set,
    authUserId: string
  ): Promise<BasicSet> {
    const cardOccurrence = await this.cardService.getAllCardsOccurencesBySetId(set.id, authUserId)
    const basicSet = set.toJSON() as BasicSet
    basicSet.nbOwned = cardOccurrence.length
    return basicSet
  }
}
