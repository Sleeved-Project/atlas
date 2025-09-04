import User from '#models/user'

export default class UsersService {
  async searchUsers(query: { username?: string }) {
    const usersQuery = User.query()
    if (query.username) usersQuery.where('username', 'like', `%${query.username}%`)
    return await usersQuery.exec()
  }

  async getUserById(id: string) {
    return await User.findOrFail(id)
  }
}
