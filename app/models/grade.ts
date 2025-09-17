import { v4 as uuidv4 } from 'uuid'
import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'

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

  @beforeCreate()
  static assignUuid(grade: Grade) {
    grade.id = uuidv4()
  }
}
