import Set from '#models/set'

export default class SetService {
  public async getAllSets(): Promise<Set[]> {
    return await Set.query().orderBy('name', 'asc')
  }
}
