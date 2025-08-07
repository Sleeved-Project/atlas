import { AuthUser } from '#types/auth_user_type'
import User from '#models/user'

export default class UserService {
  async createUser(authUser: AuthUser) {
    return await User.create({
      id: authUser.id,
      username: authUser.username,
    })
  }
  async getUserById(id: string) {
    return await User.findOrFail(id)
  }

  async updateUser(id: string, data: Partial<User>) {
    const user = await User.findOrFail(id)
    user.merge(data)
    await user.save()

    return user
  }
}
