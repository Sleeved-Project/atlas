import NotFoundException from '#exceptions/not_found_exception'
import PaymentService from '#services/payment_service'
import UserService from '#services/me_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { errors as lucidErrors } from '@adonisjs/lucid'

@inject()
export default class PaymentController {
  constructor(
    private paymentService: PaymentService,
    private userService: UserService
  ) {}

  async createAccount({ authUser, response }: HttpContext) {
    try {
      const { linkingUrl, accountId } = await this.paymentService.createAccount()
      await this.userService.updateUser(authUser.id, { stripeId: accountId })

      response.json({
        linkingUrl,
      })
    } catch (error) {
      if (error instanceof lucidErrors.E_ROW_NOT_FOUND) {
        throw new NotFoundException(error)
      }
      throw error
    }
  }
}
