import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Card_Condition'

  async up() {
    this.defer(async (db) => {
      await db.from(this.tableName).where('id', 4).update({ label: 'Excellent Condition' })
    })
  }

  async down() {
    this.defer(async (db) => {
      await db.from(this.tableName).where('id', 4).update({ label: 'Excelent Condition' })
    })
  }
}
