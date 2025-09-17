import Address from '#models/address'
import { createAddressValidator } from '#validators/address_validator'
import { Infer } from '@vinejs/vine/types'

export default class AddressService {
  public async getAddressIdByRoadCityCountry(
    road: string,
    city: string,
    country: string
  ): Promise<Address | null> {
    return await Address.query()
      .select('id')
      .where('road', road)
      .andWhere('city', city)
      .andWhere('country', country)
      .first()
  }

  public async createAddress(
    addressPayload: Infer<typeof createAddressValidator>
  ): Promise<Address> {
    return await Address.create({
      road: addressPayload.road,
      zipcode: addressPayload.zipcode,
      city: addressPayload.city,
      country: addressPayload.country,
      countrycode: addressPayload.countrycode,
      additionalInfo: addressPayload.additionalInfo || null,
    })
  }
}
