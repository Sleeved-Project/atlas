import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { errors as lucidErrors } from '@adonisjs/lucid'
import NotFoundException from '#exceptions/not_found_exception'
import DuplicateEntryException from '#exceptions/duplicate_entry_exception'
import FolioService from '#services/folio_service'
import { SuccessOutputDTO } from '#types/success_output_dto_type'
import UserService from '#services/user_service'

@inject()
export default class UserController {
  constructor(
    private folioService: FolioService,
    private userService: UserService
  ) {}

  async store({ response, authUser }: HttpContext) {
    try {
      await this.userService.createUser(authUser)

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
}
