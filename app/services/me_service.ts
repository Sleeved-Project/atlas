import { AuthUser } from '#types/auth_user_type'
import User from '#models/user'

export default class MeService {
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

  async getGradingTokenCount(id: string): Promise<number> {
    const user = await User.query().select('remaning_certificate_token').where({ id }).firstOrFail()
    return user.remaningCertificateToken
  }

  async decrementGradingTokenCount(id: string): Promise<void> {
    const user = await User.findOrFail(id)
    user.remaningCertificateToken -= 1
    await user.save()
  }
}
