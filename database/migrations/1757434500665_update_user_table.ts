import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'User'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('remaning_certificate_token').notNullable().defaultTo(3)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('remaning_certificate_token')
    })
  }
}
