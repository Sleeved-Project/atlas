import UserAddress from '#models/user_address'

export interface AddressOutputDTO {
  id: string
  road: string
  additionalInfo: string | null
  zipcode: string
  city: string
  country: string
  countrycode: string
}

export default class UserAddressMapper {
  public static toAddressOuputDTO(userAddress: UserAddress | null): AddressOutputDTO | null {
    if (!userAddress || !userAddress.address) {
      return null
    }

    return {
      id: userAddress.address.id,
      road: userAddress.address.road,
      additionalInfo: userAddress.address.additionalInfo,
      zipcode: userAddress.address.zipcode,
      city: userAddress.address.city,
      country: userAddress.address.country,
      countrycode: userAddress.address.countrycode,
    }
  }
}
