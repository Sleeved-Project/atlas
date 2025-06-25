import type { AuthUser } from '#types/auth_user_type'

declare module '@adonisjs/core/http' {
  interface HttpContext {
    authUser: AuthUser
  }
}
