import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'Card_Condition'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('percent_price_alteration').notNullable()
    })

    this.defer(async (db) => {
      // Mise à jour individuelle pour chaque enregistrement
      await db.from(this.tableName).where('id', 1).update({ percent_price_alteration: -50 })
      await db.from(this.tableName).where('id', 2).update({ percent_price_alteration: -25 })
      await db.from(this.tableName).where('id', 3).update({ percent_price_alteration: 0 })
      await db.from(this.tableName).where('id', 4).update({ percent_price_alteration: 25 })
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('percent_price_alteration')
    })
  }
}
