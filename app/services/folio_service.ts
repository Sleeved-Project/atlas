import DuplicateEntryException from '#exceptions/duplicate_entry_exception'
import Folio from '#models/folio'

export default class FolioService {
  public async createMainFolio(userId: string): Promise<Folio> {
    const existingRootFolio = await Folio.query().where({ userId, isRoot: true }).first()

    if (existingRootFolio) {
      throw new DuplicateEntryException('User already has a root folio')
    }

    return await Folio.create({
      name: 'root',
      image: null,
      isRoot: true,
      userId: userId,
    })
  }

  public async getMainFolioByUserId(userId: string): Promise<Folio> {
    return await Folio.query().where({ userId, isRoot: true }).firstOrFail()
  }
}
