import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Card_Folio'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable()
      table.uuid('folio_id').notNullable()
      table.string('card_id').notNullable()
      table.integer('occurence').notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.foreign('folio_id').references('id').inTable('Folio').onDelete('CASCADE')
      table.foreign('card_id').references('id').inTable('Card').onDelete('CASCADE')

      table.unique(['folio_id', 'card_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
