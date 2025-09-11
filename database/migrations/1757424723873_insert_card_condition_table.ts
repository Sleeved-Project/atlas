import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Card_Condition'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('code')
    })

    this.defer(async (db) => {
      await db.table(this.tableName).multiInsert([
        { id: 1, label: 'Bad Condition' },
        { id: 2, label: 'Average Condition' },
        { id: 3, label: 'Good Condition' },
        { id: 4, label: 'Excelent Condition' },
      ])
    })
  }

  async down() {
    this.defer(async (db) => {
      await db.from(this.tableName).del()
    })

    this.schema.alterTable(this.tableName, (table) => {
      table.string('code').notNullable().unique()
    })
  }
}
