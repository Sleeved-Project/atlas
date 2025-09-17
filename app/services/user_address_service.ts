import UserAddress from '#models/user_address'

export default class UserAddressService {
  public async hasMainAddress(userId: string): Promise<boolean> {
    const mainUserAddress = await UserAddress.query()
      .select('is_main')
      .where('user_id', userId)
      .andWhere('is_main', true)
      .first()
    return mainUserAddress !== null
  }

  public async createUserAddress(
    userId: string,
    addressId: string,
    isMain: boolean
  ): Promise<UserAddress> {
    return UserAddress.create({ userId, addressId, isMain })
  }
}
