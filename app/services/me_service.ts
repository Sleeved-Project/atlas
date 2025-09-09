import { AuthUser } from '#types/auth_user_type'
import User from '#models/user'
import { inject } from '@adonisjs/core'
import MediaStorageService from './media_storage_service.js'
import type { MeUpdateData } from '#types/me_type'

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

  async updateUser(id: string, data: MeUpdateData) {
    const user = await User.findOrFail(id)
    const updateData = { ...data }

    if (updateData.profilePictureBuffer) {
      updateData.profilePictureUrl = await this._processProfilePicture(
        id,
        updateData.profilePictureBuffer,
        user.profilePictureUrl
      )

      delete updateData.profilePictureBuffer
    }

    user.merge(updateData)
    await user.save()

    return user
  }

  /**
   * Handle profile picture upload and old picture deletion
   */
  private async _processProfilePicture(
    userId: string,
    buffer: Buffer,
    currentUrl: string | null
  ): Promise<string> {
    // Delete the old image if it exists
    if (currentUrl) {
      const oldPublicId = this.mediaStorage.getPublicIdFromUrl(currentUrl)
      if (oldPublicId) {
        await this.mediaStorage.deleteImage(oldPublicId).catch((err) => {
          console.error('Failed to delete old image:', err)
        })
      }
    }

    // Upload the new image
    const uploadResult = await this.mediaStorage.uploadBuffer(buffer, {
      folder: `users/${userId}/profile`,
      fileName: `picture_${Date.now()}`,
    })

    return uploadResult.url
  }
}
