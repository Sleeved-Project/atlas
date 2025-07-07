import Subtype from '#models/subtypes'

export default class SubtypeService {
  public async getAllSubtypes(): Promise<Subtype[]> {
    return await Subtype.query().orderBy('label', 'asc')
  }
}
