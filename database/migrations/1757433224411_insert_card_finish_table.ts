import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Card_Finish'

  async up() {
    this.defer(async (db) => {
      await db.table(this.tableName).multiInsert([
        {
          id: 1,
          label: 'Holofoil',
        },
        {
          id: 2,
          label: 'Normal',
        },
        {
          id: 3,
          label: 'Reverse Holofoil',
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
