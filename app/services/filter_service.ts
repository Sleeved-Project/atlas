import { inject } from '@adonisjs/core/container'
import Artist from '#models/artist'
import Rarity from '#models/rarity'
import Subtype from '#models/subtypes'

@inject()
export default class FilterService {
  public async getCardFilters(filterTypes: string[]) {
    const result: Record<string, any> = {}

    await Promise.all(
      filterTypes.map(async (type) => {
        switch (type) {
          case 'rarity':
            result.rarities = await this.getAllRarities()
            break
          case 'subtype':
            result.subtypes = await this.getAllSubtypes()
            break
          case 'artist':
            result.artists = await this.getAllArtists()
            break
          // Add more cases as needed for other filters...
        }
      })
    )

    return result
  }

  private async getAllArtists() {
    return await Artist.query().orderBy('name', 'asc')
  }

  private async getAllRarities() {
    return await Rarity.query().orderBy('label', 'asc')
  }

  private async getAllSubtypes() {
    return await Subtype.query().orderBy('label', 'asc')
  }
}
