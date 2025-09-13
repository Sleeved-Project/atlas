import cloudinary from 'cloudinary'
import fs from 'node:fs'
import env from '#start/env'
import { CloudinaryError } from '#exceptions/cloudinary_exception'
import type { CloudinaryUploadResult } from '#types/cloudinary_type'

export default class CloudinaryApiClient {
  constructor() {
    cloudinary.v2.config({
      cloud_name: env.get('CLOUDINARY_CLOUD_NAME'),
      api_key: env.get('CLOUDINARY_API_KEY'),
      api_secret: env.get('CLOUDINARY_API_SECRET'),
      secure: true,
    })
  }

  /**
   * Upload a file to Cloudinary
   * @param filePath Local path of the file (usually coming from FileService.saveFile)
   * @param folder Destination folder in Cloudinary (ex: 'ads/recto', 'ads/verso')
   * @returns Information of the uploaded file including the public URL
   */
  async uploadFile(filePath: string, folder: string = 'uploads'): Promise<CloudinaryUploadResult> {
    try {
      // Verify if file exists
      if (!fs.existsSync(filePath)) {
        throw new CloudinaryError(`File not found at path: ${filePath}`)
      }

      // Upload to Cloudinary
      const result = await cloudinary.v2.uploader.upload(filePath, {
        folder,
        resource_type: 'auto',
      })

      return {
        publicId: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        resourceType: result.resource_type,
      }
    } catch (error) {
      if (error instanceof CloudinaryError) throw error
      throw new CloudinaryError(
        `Failed to upload file to Cloudinary: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  }

  /**
   * Delete a file from Cloudinary
   * @param publicId Public ID of the file on Cloudinary
   */
  async deleteFile(publicId: string) {
    try {
      await cloudinary.v2.uploader.destroy(publicId)
    } catch (error) {
      throw new CloudinaryError(
        `Failed to delete file from Cloudinary: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }
}
