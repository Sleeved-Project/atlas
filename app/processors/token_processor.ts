import { inject } from '@adonisjs/core'
import NotEnoughtTokenException from '#exceptions/not_enought_token_exception'
import MeService from '#services/me_service'

@inject()
export default class TokenProcessor {
  constructor(private meService: MeService) {}

  /**
   * Process to verify if user has enough grading tokens.
   */
  public async verifyGradingTokens(userId: string): Promise<void> {
    const tokenCount = await this.meService.getGradingTokenCount(userId)
    if (tokenCount <= 0) {
      throw new NotEnoughtTokenException()
    }
  }
}
