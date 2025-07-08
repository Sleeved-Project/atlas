import Rarity from '#models/rarity'

export default class RarityService {
  public async getAllRarities(): Promise<Rarity[]> {
    return await Rarity.query().orderBy('label', 'asc')
  }
}
