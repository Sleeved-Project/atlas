import Type from '#models/type'

export default class TypeService {
  public async getAllTypes(): Promise<Type[]> {
    return await Type.query().orderBy('label', 'asc')
  }
}
