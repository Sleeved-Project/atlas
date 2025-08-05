import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'User_Address'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable()
      table.string('address').notNullable()
      table.string('zipcode').notNullable()
      table.string('city').notNullable()
      table.string('country').notNullable()
      table.string('country_code').notNullable()
      table.boolean('is_default').defaultTo(false).notNullable()
      table.string('user_id').notNullable().references('id').inTable('User').onDelete('CASCADE')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
