import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'User'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('profile_picture_url').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('profile_picture_url')
    })
  }
}
