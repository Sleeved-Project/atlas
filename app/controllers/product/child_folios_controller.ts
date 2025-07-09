import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { errors as lucidErrors } from '@adonisjs/lucid'
import NotFoundException from '#exceptions/not_found_exception'
import FolioService from '#services/folio_service'
import FolioMapper from '#mappers/folio_mapper'
import ConstanteUtils from '#utils/constante_utils'

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
}
