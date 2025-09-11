import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Ad'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable()
      table.string('card_id').notNullable()
      table.integer('status_id').unsigned().notNullable()
      table.integer('condition_id').unsigned().notNullable()
      table.integer('finish_id').unsigned().notNullable()
      table.uuid('seller_id').notNullable()
      table.uuid('certificate_id').nullable()

      table.decimal('original_price', 10, 2).notNullable()
      table.string('recto_image_url').notNullable()
      table.string('verso_image_url').notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.foreign('card_id').references('id').inTable('Card').onDelete('CASCADE')
      table.foreign('status_id').references('id').inTable('Ad_Status').onDelete('CASCADE')
      table.foreign('condition_id').references('id').inTable('Card_Condition').onDelete('CASCADE')
      table.foreign('finish_id').references('id').inTable('Card_Finish').onDelete('CASCADE')
      table.foreign('seller_id').references('id').inTable('User').onDelete('CASCADE')
      table.foreign('certificate_id').references('id').inTable('Certificate').onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
