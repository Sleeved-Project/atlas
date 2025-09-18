import { inject } from '@adonisjs/core'
import { createAddressValidator } from '#validators/address_validator'
import { Infer } from '@vinejs/vine/types'
import Address from '#models/address'
import AddressService from '#services/address_service'
import UserAddressService from '#services/user_address_service'

@inject()
export default class AddressProcessor {
  constructor(
    private addressService: AddressService,
    private userAddressService: UserAddressService
  ) {}

  /**
   * Process address creation.
   */
  public async processAddressCreation(
    payload: Infer<typeof createAddressValidator>,
    userId: string
  ): Promise<void> {
    let address: Address

    const existingAddress = await this.addressService.getAddressIdByRoadCityCountry(
      payload.road,
      payload.city,
      payload.country
    )

    if (existingAddress === null) {
      address = await this.addressService.createAddress(payload)
    } else {
      address = existingAddress
    }

    const hasMainAddress = await this.userAddressService.hasMainAddress(userId)

    await this.userAddressService.createUserAddress(userId, address.id, !hasMainAddress)
  }
}
