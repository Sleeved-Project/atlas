import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { errors as lucidErrors } from '@adonisjs/lucid'
import NotFoundException from '#exceptions/not_found_exception'
import FolioService from '#services/folio_service'
import { SuccessOutputDto } from '#types/success_output_dto_type'

@inject()
export default class FoliosController {
  constructor(private folioService: FolioService) {}

  async init({ response, authUser }: HttpContext) {
    try {
      await this.folioService.createMainFolio(authUser.id)
      const successResponse: SuccessOutputDto = {
        message: 'Folio initialized successfully',
      }
      return response.ok(successResponse)
    } catch (error) {
      if (error instanceof lucidErrors.E_ROW_NOT_FOUND) {
        throw new NotFoundException(error)
      }
      throw error
    }
  }
}
