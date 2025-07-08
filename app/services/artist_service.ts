import Artist from '#models/artist'

export default class ArtistService {
  public async getAllArtists(): Promise<Artist[]> {
    return await Artist.query().orderBy('name', 'asc')
  }
}
