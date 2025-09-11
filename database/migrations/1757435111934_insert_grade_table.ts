import { BaseSchema } from '@adonisjs/lucid/schema'
import { v4 as uuidv4 } from 'uuid'

export default class extends BaseSchema {
  protected tableName = 'Grade'

  async up() {
    this.defer(async (db) => {
      await db.table(this.tableName).multiInsert([
        {
          id: uuidv4(),
          label: 'Gem Mint',
          code: 'GM',
          description:
            'Perfect card. No signs of wear, no printing defects. Perfect centering, sharp corners, clean edges, and spotless surface.',
          min_grade: 9,
          max_grade: 10,
        },
        {
          id: uuidv4(),
          label: 'Mint',
          code: 'MT',
          description:
            'Nearly perfect card with minimal imperfections. Excellent centering, sharp corners, and clean edges. Minimal to no surface wear.',
          min_grade: 8,
          max_grade: 9,
        },
        {
          id: uuidv4(),
          label: 'Near Mint',
          code: 'NM',
          description:
            'Card in exceptional condition with very minor wear. Slight imperfections in centering or minimal edge wear. Corners remain sharp.',
          min_grade: 7,
          max_grade: 8,
        },
        {
          id: uuidv4(),
          label: 'Excellent',
          code: 'EX',
          description:
            'Card shows minor wear but maintains overall good appearance. Slight corner wear, minor edge wear, and possible slight surface scratches.',
          min_grade: 6,
          max_grade: 7,
        },
        {
          id: uuidv4(),
          label: 'Good',
          code: 'GD',
          description:
            'Card shows minor wear but maintains overall good appearance. Slight corner wear, minor edge wear, and possible slight surface scratches.',
          min_grade: 5,
          max_grade: 6,
        },
        {
          id: uuidv4(),
          label: 'Light Played',
          code: 'LP',
          description:
            'Card shows clear signs of play with noticeable wear. Visible edge and corner wear, possible light creases, and surface scratches.',
          min_grade: 4,
          max_grade: 5,
        },
        {
          id: uuidv4(),
          label: 'Moderately Played',
          code: 'MP',
          description:
            'Card shows significant wear from play. Multiple creases, rounded corners, edge wear, and surface scratches are present.',
          min_grade: 3,
          max_grade: 4,
        },
        {
          id: uuidv4(),
          label: 'Heavily Played',
          code: 'HP',
          description:
            'Card shows extensive wear and damage. Major creases, severe corner wear, possible discoloration, and heavy surface wear.',
          min_grade: 2,
          max_grade: 3,
        },
        {
          id: uuidv4(),
          label: 'Damaged',
          code: 'DM',
          description:
            'Card shows extensive wear and damage. Major creases, severe corner wear, possible discoloration, and heavy surface wear.',
          min_grade: 1,
          max_grade: 2,
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
