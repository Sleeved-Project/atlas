import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Grade extends BaseModel {
  /**
   * The table associated with the model.
   */
  static table = 'Grade'

  @column({ isPrimary: true })
  declare id: string

  @column({ columnName: 'min_grade' })
  declare minGrade: number

  @column({ columnName: 'max_grade' })
  declare maxGrade: number

  @column()
  declare label: string

  @column()
  declare description: string

  @column()
  declare code: string
}
