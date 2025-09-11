import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Grade'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable()

      table.integer('min_grade').notNullable()
      table.integer('max_grade').notNullable()
      table.string('label').notNullable()
      table.text('description').notNullable()
      table.string('code').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
