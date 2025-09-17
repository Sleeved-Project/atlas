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
    return user.remainingCertificateToken
  }

  async decrementGradingTokenCount(id: string): Promise<void> {
    const user = await User.findOrFail(id)
    user.remainingCertificateToken -= 1
    await user.save()
  }

  async getCustomerIdByUserId(id: string): Promise<string | null> {
    const user = await User.query().select('customer_id').where({ id }).firstOrFail()
    return user.customerId
  }
}
