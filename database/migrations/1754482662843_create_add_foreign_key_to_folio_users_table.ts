import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Folio'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.foreign('user_id').references('id').inTable('User').onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign(['user_id'])
    })
  }
}
