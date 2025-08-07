import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Card_Finish'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('label').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
