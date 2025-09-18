import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Order'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable()
      table.string('payment_intent_id').notNullable().unique()
      table.uuid('delivery_address_id').notNullable()
      table.uuid('order_address_id').notNullable()
      table.integer('status_id').unsigned().notNullable()

      table.decimal('total_costs', 10, 2).notNullable()
      table.decimal('service_costs', 10, 2).notNullable()
      table.decimal('shipping_costs', 10, 2).notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table
        .foreign('payment_intent_id')
        .references('id')
        .inTable('Payment_Intent')
        .onDelete('CASCADE')
      table.foreign('delivery_address_id').references('id').inTable('Address').onDelete('CASCADE')
      table.foreign('order_address_id').references('id').inTable('Address').onDelete('CASCADE')
      table.foreign('status_id').references('id').inTable('Order_Status').onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
