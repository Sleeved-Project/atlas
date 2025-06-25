import WardenApiClient from '#clients/warden_api_client'
import { AuthUser } from '#types/auth_user_type'
import { inject } from '@adonisjs/core'

@inject()
export default class AuthService {
  constructor(protected wardenApiClient: WardenApiClient) {}

  public async getMe(token: string): Promise<AuthUser> {
    try {
      const response = await this.wardenApiClient.getMe(token)
      return response
    } catch (error) {
      throw error
    }
  }
}
