import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'User_Address'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable()
      table.uuid('address_id').notNullable()
      table.uuid('user_id').notNullable()

      table.boolean('is_main').notNullable()

      table.foreign('address_id').references('id').inTable('Address').onDelete('CASCADE')
      table.foreign('user_id').references('id').inTable('User').onDelete('CASCADE')

      table.unique(['address_id', 'user_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
