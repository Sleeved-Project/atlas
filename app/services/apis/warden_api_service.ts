import env from '#start/env'
import { AuthUser } from '#types/warden_auth_type'

export default class WardenApiService {
  private readonly baseUrl = env.get('WARDEN_API_BASE_URL')

  public async getMe(token: string): Promise<AuthUser> {
    const response = await this.fetchData<AuthUser>('/me', {
      Authorization: `Bearer ${token}`,
    })
    console.log('response', response)
    return response
  }

  private async fetchData<T>(endPoint: string, headers: Record<string, string> = {}): Promise<T> {
    try {
      const url = `${this.baseUrl}${endPoint}`
      const response = await fetch(url, { headers })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = (await response.json()) as T

      return data
    } catch (error) {
      console.error('Failed to fetch data', error)
      throw new Error('Failed to fetch data')
    }
  }
}
