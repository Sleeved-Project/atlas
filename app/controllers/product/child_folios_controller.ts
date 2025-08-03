import CardNotOwnedException from '#exceptions/card_not_owned_exception'
import InsufficientCardOccurrenceException from '#exceptions/card_occurrence_exception'
import FolioNotOwnedException from '#exceptions/folio_not_owned_exception'
import NotChildFolioException from '#exceptions/not_child_folio_exception'
import NotFoundException from '#exceptions/not_found_exception'
import ValidationException from '#exceptions/validation_exception'
import FolioMapper from '#mappers/folio_mapper'
import CardFolioService from '#services/card_folio_service'
import CardService from '#services/card_service'
import FolioService from '#services/folio_service'
import { SuccessOutputDTO } from '#types/success_output_dto_type'
import ConstantUtils from '#utils/constant_utils'
import { createChildFolioValidator } from '#validators/folio_validator'
import { childFolioCardsValidator, showChildFolioValidator } from '#validators/folio_validator'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { errors as lucidErrors } from '@adonisjs/lucid'
import { errors as vineErrors } from '@vinejs/vine'

@inject()
export default class ChildFoliosController {
  constructor(
    private folioService: FolioService,
    private cardService: CardService,
    private cardFolioService: CardFolioService
  ) {}

  async index({ response, authUser }: HttpContext) {
    try {
      const childFolioWithCardPrices =
        await this.folioService.getAllChildFolioWithCardPricesByUserId(
          authUser.id,
          ConstantUtils.DAY_BEFORE_DEFAULT_COUNT
        )
      const childFoliosInfosAndStatisticsList =
        FolioMapper.toChildFoliosInfosAndStatisticsListOuputDTO(childFolioWithCardPrices)
      return response.ok(childFoliosInfosAndStatisticsList)
    } catch (error) {
      if (error instanceof lucidErrors.E_ROW_NOT_FOUND) {
        throw new NotFoundException(error)
      }
      throw error
    }
  }

  async show({ request, response, authUser }: HttpContext) {
    try {
      const { params } = await request.validateUsing(showChildFolioValidator)

      const folio = await this.folioService.getFolioByFolioId(params.id)
      if (folio.userId !== authUser.id) {
        throw new FolioNotOwnedException(folio.id)
      }
      if (folio.isRoot) {
        throw new NotChildFolioException(folio.id)
      }

      const childFolioWithLastCardPrices = await this.folioService.getMyChildFolioWithCardPrices(
        folio.id,
        ConstantUtils.DAY_BEFORE_DEFAULT_COUNT
      )
      const childFolioWithYesterdayCardPrices =
        await this.folioService.getMyChildFolioWithCardPrices(
          folio.id,
          ConstantUtils.DAY_BEFORE_LAST_DAY_COUNT
        )

      const folioWithStatistics = FolioMapper.toFoliosDetailsOutputDTO(
        childFolioWithLastCardPrices,
        childFolioWithYesterdayCardPrices
      )
      return response.ok(folioWithStatistics)
    } catch (error) {
      if (error instanceof vineErrors.E_VALIDATION_ERROR) {
        throw new ValidationException(error)
      }
      if (error instanceof lucidErrors.E_ROW_NOT_FOUND) {
        throw new NotFoundException(error)
      }
      throw error
    }
  }

  async cards({ request, response, authUser }: HttpContext) {
    try {
      const { params, filters } = await childFolioCardsValidator.validate({
        params: request.params(),
        filters: request.qs(),
      })

      const folio = await this.folioService.getFolioByFolioId(params.id)
      if (folio.userId !== authUser.id) {
        throw new FolioNotOwnedException(folio.id)
      }
      if (folio.isRoot) {
        throw new NotChildFolioException(folio.id)
      }

      const childFolioCards = await this.cardFolioService.getAllChildFolioCards(filters, params.id)

      return response.ok(childFolioCards)
    } catch (error) {
      if (error instanceof vineErrors.E_VALIDATION_ERROR) {
        throw new ValidationException(error)
      }
      if (error instanceof lucidErrors.E_ROW_NOT_FOUND) {
        throw new NotFoundException(error)
      }
      throw error
    }
  }

  async store({ request, response, authUser }: HttpContext) {
    try {
      const payload = await createChildFolioValidator.validate(request.all())
      const mainFolio = await this.folioService.getMainFolioByUserId(authUser.id)

      for (const card of payload.cards) {
        await this.cardService.getCardIdById(card.id)
        const cardInMainFolio = await this.cardFolioService.getCardFolioByCardIdAndFolioId(
          card.id,
          mainFolio.id
        )

        if (!cardInMainFolio) {
          throw new CardNotOwnedException(card.id)
        }

        if (card.occurrence > cardInMainFolio.occurrence) {
          throw new InsufficientCardOccurrenceException(
            card.id,
            card.occurrence,
            cardInMainFolio.occurrence
          )
        }
      }

      const folio = await this.folioService.createFolio(authUser.id, payload.name, payload.imageUrl)
      for (const card of payload.cards) {
        await this.cardFolioService.createCardFolio(card.id, folio.id, card.occurrence)
      }

      const successResponse: SuccessOutputDTO = {
        message: 'Folio created successfully',
      }
      return response.ok(successResponse)
    } catch (error) {
      if (error instanceof vineErrors.E_VALIDATION_ERROR) {
        throw new ValidationException(error)
      }
      if (error instanceof lucidErrors.E_ROW_NOT_FOUND) {
        throw new NotFoundException(error)
      }
      throw error
    }
  }
}
