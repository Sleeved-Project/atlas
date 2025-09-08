import { AuthUser } from '#types/auth_user_type'
import User from '#models/user'
import { inject } from '@adonisjs/core'
import MediaStorageService from './media_storage_service.js'
import type { UserUpdateData } from '#types/user_type'

@inject()
export default class UserService {
  constructor(private mediaStorage: MediaStorageService) {}

  async createUser(authUser: AuthUser) {
    return await User.create({
      id: authUser.id,
      username: authUser.username,
    })
  }

  async getUserById(id: string) {
    return await User.findOrFail(id)
  }

  async updateUser(id: string, data: UserUpdateData) {
    const user = await User.findOrFail(id)
    const updateData = { ...data }

    // Traiter l'image de profil séparément si fournie
    if (updateData.profilePictureBuffer) {
      updateData.profilePictureUrl = await this._processProfilePicture(
        id,
        updateData.profilePictureBuffer,
        user.profilePictureUrl
      )

      // Ne pas stocker le buffer en base de données
      delete updateData.profilePictureBuffer
    }

    user.merge(updateData)
    await user.save()

    return user
  }

  /**
   * Méthode privée pour traiter l'upload d'une image de profil utilisateur
   */
  private async _processProfilePicture(
    userId: string,
    buffer: Buffer,
    currentUrl: string | null
  ): Promise<string> {
    // Supprimer l'ancienne image si elle existe
    if (currentUrl) {
      const oldPublicId = this.mediaStorage.getPublicIdFromUrl(currentUrl)
      if (oldPublicId) {
        await this.mediaStorage.deleteImage(oldPublicId).catch((err) => {
          console.error("Échec de la suppression de l'ancienne image:", err)
        })
      }
    }

    // Uploader la nouvelle image
    const uploadResult = await this.mediaStorage.uploadBuffer(buffer, {
      folder: `users/${userId}/profile`,
      fileName: `picture_${Date.now()}`,
    })

    return uploadResult.url
  }
}
