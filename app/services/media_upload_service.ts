import { inject } from '@adonisjs/core'
import CloudinaryApiClient from '#clients/cloudinary_api_client'

@inject()
export default class MediaUploadService {
  constructor(private cloudinaryClient: CloudinaryApiClient) {}

  /**
   * Upload a file and return the public URL.
   */
  public async upload(filePath: string, folder: string): Promise<string> {
    const result = await this.cloudinaryClient.uploadFile(filePath, folder)
    return result.url
  }
}
