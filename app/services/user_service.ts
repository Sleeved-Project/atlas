import { AuthUser } from '#types/auth_user_type'
import User from '#models/user'

export default class UserService {
  async createUser(authUser: AuthUser) {
    return await User.create({
      id: authUser.id,
      username: authUser.username,
    })
  }
}
