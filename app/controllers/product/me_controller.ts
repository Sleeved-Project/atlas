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
import { getAdBaseParamsValidator } from '#validators/ad_validator'
import PaymentIntentService from '#services/payment_intent_service'
import PaymentIntentMapper from '#mappers/payment_intent_mapper'
import OrderMapper from '#mappers/order_mapper'
import AddressService from '#services/address_service'
// import AdMapper from '#mappers/ad_mapper'
// import UsersService from '#services/users_service'
import NotAllowedToPerformException from '#exceptions/not_allowed_to_buy_exception'
import ShippingLabelService from '#services/shipping_service'

@inject()
export default class MeController {
  constructor(
    private folioService: FolioService,
    private meService: MeService,
    private userAddressService: UserAddressService,
    private orderService: OrderService,
    private orderProcessor: OrderProcessor,
    private paymentIntentService: PaymentIntentService,
    private addressService: AddressService,
    // private userService: UsersService,
    private shippingService: ShippingLabelService
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

  async hasStripeAccount({ response, authUser }: HttpContext) {
    try {
      const user = await this.meService.getUserById(authUser.id)
      const hasAccount = user.stripeId ? true : false
      return response.ok({ hasStripeAccount: hasAccount })
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

  async adShipingLabel({ response, request, authUser }: HttpContext) {
    try {
      const params = await getAdBaseParamsValidator.validate(request.params())
      const paymentIntent = await this.paymentIntentService.getPaymentIntentSuccededByAdId(
        params.id
      )
      if (paymentIntent.toId !== authUser.id) {
        throw new NotAllowedToPerformException()
      }
      // const buyer = await this.userService.getUserById(paymentIntent.fromId)
      const buyerOrder = await this.orderService.getOrdersByPaymentIntent(paymentIntent.id)
      const delveryAddress = await this.addressService.createAddressById(
        buyerOrder.deliveryAddressId
      )

      // const shippingLabelOutputDTO = AdMapper.toShippingLabelOutputDTO(buyer, delveryAddress)
      const trackingNumber = `TRACK-${Date.now()}`

      const pdfBuffer = await this.shippingService.generateShippingLabel(
        {
          name: paymentIntent.to.username ? paymentIntent.to.username : 'seller',
          address: delveryAddress.road,
          city: delveryAddress.city,
          zipcode: delveryAddress.zipcode,
          country: delveryAddress.country,
        },
        {
          name: paymentIntent.from.username ? paymentIntent.from.username : 'buyer',
          address: delveryAddress.road,
          city: delveryAddress.city,
          zipcode: delveryAddress.zipcode,
          country: delveryAddress.country,
        },
        trackingNumber,
        buyerOrder.id
      )

      response.header('Content-Type', 'application/pdf')
      response.header('Content-Disposition', 'attachment; filename=shipping-label.pdf')
      return response.send(pdfBuffer)
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

  async showOrder({ response, request, authUser }: HttpContext) {
    try {
      const params = await getAdBaseParamsValidator.validate(request.params())
      const order = await this.orderService.getOrdersByIdAndUserId(authUser.id, params.id)
      const mainAddress = await this.userAddressService.getMainAddress(authUser.id)
      const orderDetailsOutputDTO = OrderMapper.toOrderDetailsOutputDTO(order, mainAddress)
      return response.ok(orderDetailsOutputDTO)
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
