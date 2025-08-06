import CardCondition from '#models/card_condition'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    const uniqueKey = 'id'
    await CardCondition.updateOrCreateMany(uniqueKey, [
      {
        id: 1,
        label: 'Gem Mint',
        code: 'GM',
      },
      {
        id: 2,
        label: 'Mint',
        code: 'MT',
      },
      {
        id: 3,
        label: 'Near Mint',
        code: 'NM',
      },
      {
        id: 4,
        label: 'Excellent',
        code: 'EX',
      },
      {
        id: 5,
        label: 'Good',
        code: 'GD',
      },
      {
        id: 6,
        label: 'Light Played',
        code: 'LP',
      },
      {
        id: 7,
        label: 'Moderately Played',
        code: 'MP',
      },
      {
        id: 8,
        label: 'Heavily Played',
        code: 'HP',
      },
      {
        id: 9,
        label: 'Damaged',
        code: 'DM',
      },
    ])
  }
}
