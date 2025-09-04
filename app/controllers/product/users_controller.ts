import NotFoundException from '#exceptions/not_found_exception'
import UsersService from '#services/users_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { errors as lucidErrors } from '@adonisjs/lucid'

@inject()
export default class UsersController {
  constructor(private usersService: UsersService) {}

  async search({ request, response }: HttpContext) {
    try {
      const users = await this.usersService.searchUsers(request.qs())
      return response.ok(users)
    } catch (error) {
      if (error instanceof lucidErrors.E_ROW_NOT_FOUND) {
        throw new NotFoundException(error)
      }
      throw error
    }
  }

  async show({ response, authUser }: HttpContext) {
    try {
      const user = await this.usersService.getUserById(authUser.id)
      return response.ok(user)
    } catch (error) {
      if (error instanceof lucidErrors.E_ROW_NOT_FOUND) {
        throw new NotFoundException(error)
      }
      throw error
    }
  }
}
