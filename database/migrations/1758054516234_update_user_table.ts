import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'User'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('customer_id').nullable().defaultTo(null)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('customer_id')
    })
  }
}
