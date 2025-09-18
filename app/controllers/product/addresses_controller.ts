import NotFoundException from '#exceptions/not_found_exception'
import ValidationException from '#exceptions/validation_exception'
import { SuccessOutputDTO } from '#types/success_output_dto_type'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import { errors as lucidErrors } from '@adonisjs/lucid'
import { errors as vineErrors } from '@vinejs/vine'
import { createAddressValidator } from '#validators/address_validator'
import DuplicateEntryException from '#exceptions/duplicate_entry_exception'
import AddressProcessor from '#processors/address_processor'

@inject()
export default class AddressesController {
  constructor(private addressProcessor: AddressProcessor) {}

  async store({ request, response, authUser }: HttpContext) {
    try {
      const payload = await request.validateUsing(createAddressValidator)
      await this.addressProcessor.processAddressCreation(payload, authUser.id)
      const successResponse: SuccessOutputDTO = {
        message: 'Address created and linked successfully',
      }
      return response.ok(successResponse)
    } catch (error) {
      if (error instanceof vineErrors.E_VALIDATION_ERROR) {
        throw new ValidationException(error)
      }
      if (error.code === 'ER_DUP_ENTRY') {
        throw new DuplicateEntryException('User has already linked this address')
      }
      if (error instanceof lucidErrors.E_ROW_NOT_FOUND) {
        throw new NotFoundException(error)
      }
      throw error
    }
  }
}
