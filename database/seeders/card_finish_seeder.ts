import CardFinish from '#models/card_finish'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    const uniqueKey = 'id'
    await CardFinish.updateOrCreateMany(uniqueKey, [
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
  }
}
