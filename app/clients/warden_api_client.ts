import AuthException from '#exceptions/auth_exception'
import { WardenException } from '#exceptions/warden_exception'
import env from '#start/env'
import { AuthUser } from '#types/auth_user_type'

export default class WardenApiClient {
  private readonly baseUrl = env.get('WARDEN_API_BASE_URL')

  public async getMe(token: string): Promise<AuthUser> {
    try {
      const response = await fetch(`${this.baseUrl}/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new AuthException()
      }

      const data = (await response.json()) as AuthUser

      return data
    } catch (error) {
      if (error instanceof AuthException) {
        throw error
      }
      throw new WardenException()
    }
  }
}
