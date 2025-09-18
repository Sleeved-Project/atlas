import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Order_Status'

  async up() {
    this.defer(async (db) => {
      await db.table(this.tableName).multiInsert([
        {
          id: 1,
          label: 'Pending delivery',
        },
        {
          id: 2,
          label: 'Sent',
        },
        {
          id: 3,
          label: 'Delivered',
        },
        {
          id: 4,
          label: 'Canceled',
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
