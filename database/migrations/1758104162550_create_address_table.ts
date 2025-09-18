import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Address'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable()

      table.string('road').notNullable()
      table.string('additional_info').nullable()
      table.string('zipcode').notNullable()
      table.string('city').notNullable()
      table.string('country').notNullable()
      table.string('countrycode').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
