import NotFoundException from '#exceptions/not_found_exception'
import ValidationException from '#exceptions/validation_exception'
import UsersService from '#services/users_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { errors as lucidErrors } from '@adonisjs/lucid'
import { errors as vineErrors } from '@vinejs/vine'
import {
  searchUsersValidator,
  getUserParamsValidator,
  getUserAdsValidator,
  getUserAdsParamsValidator,
} from '#validators/users_validator'

@inject()
export default class UsersController {
  constructor(private usersService: UsersService) {}

  async search({ request, response }: HttpContext) {
    try {
      const filters = await searchUsersValidator.validate(request.qs())
      const users = await this.usersService.searchUsers(filters)
      return response.ok(users)
    } catch (error) {
      if (error instanceof vineErrors.E_VALIDATION_ERROR) {
        throw new ValidationException(error)
      }
      throw error
    }
  }

  async show({ request, response }: HttpContext) {
    try {
      const params = await getUserParamsValidator.validate(request.params())
      const user = await this.usersService.getUserById(params.id)
      const publicUserData = {
        id: user.id,
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
        profilePictureUrl: user.profilePictureUrl,
        description: user.description,
        createdAt: user.createdAt,
      }
      return response.ok(publicUserData)
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

  async ads({ request, response }: HttpContext) {
    try {
      const urlParams = await getUserAdsParamsValidator.validate(request.params())
      const queryParams = await getUserAdsValidator.validate(request.qs())

      const ads = await this.usersService.getUserAds({
        userId: urlParams.id,
        ...queryParams,
      })
      return response.ok(ads)
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
