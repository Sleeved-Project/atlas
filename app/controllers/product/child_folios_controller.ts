import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { errors as lucidErrors } from '@adonisjs/lucid'
import { errors as vineErrors } from '@vinejs/vine'
import NotFoundException from '#exceptions/not_found_exception'
import FolioService from '#services/folio_service'
import FolioMapper from '#mappers/folio_mapper'
import ConstanteUtils from '#utils/constante_utils'
import { showChildFolioValidator } from '#validators/folio_validator'
import FolioNotOwnedException from '#exceptions/folio_not_owned_exception'
import NotChildFolioException from '#exceptions/not_child_folio_exception'
import ValidationException from '#exceptions/validation_exception'

@inject()
export default class ChildFoliosController {
  constructor(private folioService: FolioService) {}

  async index({ response, authUser }: HttpContext) {
    try {
      const childFolioWithCardPrices =
        await this.folioService.getAllChildFolioWithCardPricesByUserId(
          authUser.id,
          ConstanteUtils.TODAY_DAY_BEFORE_COUNT
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

      const childFolioWithTodayCardPrices = await this.folioService.getMyChildFolioWithCardPrices(
        folio.id,
        ConstanteUtils.TODAY_DAY_BEFORE_COUNT
      )
      const childFolioWithYesterdayCardPrices =
        await this.folioService.getMyChildFolioWithCardPrices(
          folio.id,
          ConstanteUtils.YESTERDAY_DAY_BEFORE_COUNT
        )

      const folioWithStatistics = FolioMapper.toFoliosDetailsOutputDTO(
        childFolioWithTodayCardPrices,
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
}
