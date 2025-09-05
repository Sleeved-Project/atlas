import User from '#models/user'
import { SearchUsersFilters } from '#types/users_type'

export default class UsersService {
  async searchUsers(filters: SearchUsersFilters) {
    const { username, page = 1, limit = 20 } = filters
    const usersQuery = User.query()

    if (username) usersQuery.where('username', 'like', `%${username}%`)

    const result = await usersQuery.paginate(page, limit)

    return {
      data: result.all().map((user) => ({
        id: user.id,
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
        profilePictureUrl: user.profilePictureUrl,
        createdAt: user.createdAt,
      })),
      meta: result.getMeta(),
    }
  }

  async getUserById(id: string) {
    return await User.findOrFail(id)
  }
}
