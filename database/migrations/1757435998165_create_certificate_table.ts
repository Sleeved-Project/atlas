import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Certificate'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable()
      table.string('card_id').notNullable()
      table.uuid('certified_by_id').notNullable()
      table.uuid('grade_id').notNullable()

      table.timestamp('certified_at').notNullable()
      table.decimal('global_rating', 10, 2).notNullable()
      table.decimal('centering_rating', 10, 2).notNullable()
      table.decimal('corner_rating', 10, 2).notNullable()
      table.decimal('edge_rating', 10, 2).notNullable()
      table.decimal('surface_rating', 10, 2).notNullable()

      table.foreign('card_id').references('id').inTable('Card').onDelete('CASCADE')
      table.foreign('certified_by_id').references('id').inTable('User').onDelete('CASCADE')
      table.foreign('grade_id').references('id').inTable('Grade').onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
