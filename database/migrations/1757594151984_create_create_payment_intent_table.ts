import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Payment_Intent'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary().notNullable()
      table.uuid('from_id').notNullable()
      table.uuid('to_id').notNullable()
      table.uuid('ad_id').notNullable()
      table.string('status').notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.foreign('from_id').references('id').inTable('User').onDelete('CASCADE')
      table.foreign('to_id').references('id').inTable('User').onDelete('CASCADE')
      table.foreign('ad_id').references('id').inTable('Ad').onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
