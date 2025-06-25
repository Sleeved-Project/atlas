import AuthException from '#exceptions/auth_exception'
import AuthService from '#services/auth_service'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import '#types/http_context_extension_type'
import { inject } from '@adonisjs/core'

@inject()
export default class AuthMiddleware {
  constructor(protected authService: AuthService) {}

  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * Middleware logic goes here (before the next call)
     */
    /**
     * Ensure the auth header exists
     */
    const authHeader = ctx.request.header('authorization')
    if (!authHeader) {
      throw new AuthException()
    }

    /**
     * Split the header value and read the token from it
     */
    const [, token] = authHeader.split('Bearer ')
    if (!token) {
      throw new AuthException()
    }

    const authUser = await this.authService.getMe(token)
    ctx.authUser = authUser

    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()
    return output
  }
}
