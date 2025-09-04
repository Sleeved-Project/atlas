import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { errors as lucidErrors } from '@adonisjs/lucid'
import { errors as vineErrors } from '@vinejs/vine'
import ValidationException from '#exceptions/validation_exception'
import NotFoundException from '#exceptions/not_found_exception'
import DuplicateEntryException from '#exceptions/duplicate_entry_exception'
import FolioService from '#services/folio_service'
import { SuccessOutputDTO } from '#types/success_output_dto_type'
import MeService from '#services/me_service'
import { updateUserValidator } from '#validators/user_validator'

@inject()
export default class MeController {
  constructor(
    private folioService: FolioService,
    private meService: MeService
  ) {}

  async store({ response, authUser }: HttpContext) {
    try {
      await this.meService.createUser(authUser)

      // Initialize the user's main folio
      await this.folioService.createMainFolio(authUser.id)

      const successResponse: SuccessOutputDTO = {
        message: `User ${authUser.username} with id ${authUser.id} initialized successfully`,
      }

      return response.created(successResponse)
    } catch (error) {
      if (error instanceof lucidErrors.E_ROW_NOT_FOUND) {
        throw new NotFoundException(error)
      }
      if (error.code === 'ER_DUP_ENTRY') {
        throw new DuplicateEntryException('User already initialized')
      }
      throw error
    }
  }

  async show({ response, authUser }: HttpContext) {
    try {
      const user = await this.meService.getUserById(authUser.id)
      return response.ok(user)
    } catch (error) {
      if (error instanceof lucidErrors.E_ROW_NOT_FOUND) {
        throw new NotFoundException(error)
      }
      throw error
    }
  }
  async update({ request, response, authUser }: HttpContext) {
    try {
      const validatedData = await request.validateUsing(updateUserValidator)
      const updatedUser = await this.meService.updateUser(authUser.id, validatedData)

      return response.ok(updatedUser)
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
