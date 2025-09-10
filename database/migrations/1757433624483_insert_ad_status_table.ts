import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Ad_Status'

  async up() {
    this.defer(async (db) => {
      await db.table(this.tableName).multiInsert([
        {
          id: 1,
          label: 'Published',
        },
        {
          id: 2,
          label: 'Sold',
        },
        {
          id: 3,
          label: 'Archived',
        },
        {
          id: 4,
          label: 'Draft',
        },
      ])
    })
  }

  async down() {
    this.defer(async (db) => {
      await db.from(this.tableName).del()
    })
  }
}
