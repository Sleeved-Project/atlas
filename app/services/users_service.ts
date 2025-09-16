import Ad from '#models/ad'
import User from '#models/user'
import { SearchUsersFilters, UserAdsQuery } from '#types/users_type'
import AdMapper from '#mappers/ad_mapper'
import UsersMapper from '#mappers/users_mapper'

export default class UsersService {
  async searchUsers(filters: SearchUsersFilters) {
    const { username, page = 1, limit = 20 } = filters
    const usersQuery = User.query()

    if (username) usersQuery.where('username', 'like', `%${username}%`)

    const result = await usersQuery.paginate(page, limit)

    return {
      data: result.all().map(UsersMapper.toPublicUserData),
      meta: result.getMeta(),
    }
  }

  async getUserById(id: string) {
    return await User.findOrFail(id)
  }

  async getUserAds(request: UserAdsQuery) {
    const { userId, page = 1, limit = 20 } = request

    const ads = await Ad.query()
      .where('seller_id', userId)
      .preload('card', (cardQuery) => {
        cardQuery.select(['id', 'name'])
      })
      .preload('condition')
      .preload('finish')
      .preload('status')
      .preload('certificate')
      .preload('seller', (sellerQuery) => {
        sellerQuery.select(['id', 'username', 'profilePictureUrl'])
      })
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)

    return {
      data: ads.all().map(AdMapper.toListData),
      meta: ads.getMeta(),
    }
  }
}
