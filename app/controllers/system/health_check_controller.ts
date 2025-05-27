import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class HealthCheckController {
  /**
   * Check the health of the application and database connection
   */
  async handle({ response }: HttpContext) {
    try {
      // Basic database query to check db connection
      await db.connection().rawQuery('SELECT 1 + 1 as result')

      return response.status(200).json({
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      })
    } catch (error) {
      return response.status(503).json({
        status: 'unhealthy',
        database: 'disconnected',
        error: error.message,
        timestamp: new Date().toISOString(),
      })
    }
  }
}
