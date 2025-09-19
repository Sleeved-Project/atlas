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
import { updateUserValidator } from '#validators/me_validator'
import UserAddressService from '#services/user_address_service'
import UserAddressMapper from '#mappers/user_address_mapper'
import OrderService from '#services/order_service'
import { getOrdersFiltersValidator } from '#validators/order_validator'
import OrderProcessor from '#processors/order_processor'
import StripeApiClient from '#clients/stripe_api_client'
import { getAdBaseParamsValidator } from '#validators/ad_validator'
import PaymentIntentService from '#services/payment_intent_service'
import PaymentIntentMapper from '#mappers/payment_intent_mapper'

@inject()
export default class MeController {
  constructor(
    private folioService: FolioService,
    private meService: MeService,
    private userAddressService: UserAddressService,
    private orderService: OrderService,
    private orderProcessor: OrderProcessor,
    private paymentIntentService: PaymentIntentService,
    private stripeApiClient: StripeApiClient
  ) {
    this.stripeApiClient = new StripeApiClient()
  }

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

  async hasValidStripeAccount({ response, authUser }: HttpContext) {
    try {
      const user = await this.meService.getUserById(authUser.id)
      if (!user.stripeId) {
        return response.ok({ hasValidStripeAccount: false })
      }
      const stripeAccountTOSAcceptance = await this.stripeApiClient.retrieveStripeAccount(
        user.stripeId
      )

      // If this is true then the user has successfully completed the Stripe onboarding
      // If not we redirect him to complete it from the front end
      if (stripeAccountTOSAcceptance && stripeAccountTOSAcceptance.date !== null) {
        return response.ok({ hasValidStripeAccount: true })
      } else {
        return response.ok({ hasValidStripeAccount: false })
      }
    } catch (error) {
      if (error instanceof lucidErrors.E_ROW_NOT_FOUND) {
        throw new NotFoundException(error)
      }
      throw error
    }
  }

  async tokens({ response, authUser }: HttpContext) {
    try {
      const remainingCertificateToken = await this.meService.getGradingTokenCount(authUser.id)
      return response.ok({ remainingCertificateToken })
    } catch (error) {
      if (error instanceof lucidErrors.E_ROW_NOT_FOUND) {
        throw new NotFoundException(error)
      }
      throw error
    }
  }

  async mainAddress({ response, authUser }: HttpContext) {
    try {
      const mainUserAddress = await this.userAddressService.getMainAddressOrNull(authUser.id)
      const address = UserAddressMapper.toAddressOuputDTO(mainUserAddress)
      return response.ok({ address })
    } catch (error) {
      if (error instanceof lucidErrors.E_ROW_NOT_FOUND) {
        throw new NotFoundException(error)
      }
      throw error
    }
  }

  async orders({ response, request, authUser }: HttpContext) {
    try {
      const filters = await getOrdersFiltersValidator.validate(request.qs())
      const paginatedOrders = await this.orderService.getPaginatedOrdersByUserId(
        authUser.id,
        filters
      )
      const orderListOutputDTO = await this.orderProcessor.processOrdersList(paginatedOrders)
      return response.ok(orderListOutputDTO)
    } catch (error) {
      console.error(error)
      if (error instanceof vineErrors.E_VALIDATION_ERROR) {
        throw new ValidationException(error)
      }
      if (error instanceof lucidErrors.E_ROW_NOT_FOUND) {
        throw new NotFoundException(error)
      }
      throw error
    }
  }

  async adBuyer({ response, request, authUser }: HttpContext) {
    try {
      const params = await getAdBaseParamsValidator.validate(request.params())
      console.log(params.id, authUser.id)
      const buyerInfos = await this.paymentIntentService.getPaymentIntentBuyerInfosByAdIdAndUserId(
        authUser.id,
        params.id
      )
      const buyerInfosOutputDTO = PaymentIntentMapper.toPaymentIntentBuyerInfosOutputDTO(buyerInfos)
      return response.ok(buyerInfosOutputDTO)
    } catch (error) {
      console.error(error)
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
