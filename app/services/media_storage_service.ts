import env from '#start/env'
import { v2 as cloudinary } from 'cloudinary'

export interface UploadOptions {
  folder?: string
  fileName?: string
  transformation?: any
}

export interface UploadResult {
  url: string
  publicId: string
}

export default class MediaStorageService {
  constructor() {
    cloudinary.config({
      cloud_name: env.get('CLOUDINARY_CLOUD_NAME'),
      api_key: env.get('CLOUDINARY_API_KEY'),
      api_secret: env.get('CLOUDINARY_API_SECRET'),
      secure: true,
    })
  }

  public async uploadBuffer(buffer: Buffer, options: UploadOptions = {}): Promise<UploadResult> {
    const base64Data = buffer.toString('base64')
    const dataURI = `data:image/jpeg;base64,${base64Data}`

    const uploadOptions: any = {
      resource_type: 'auto',
      unique_filename: true,
    }

    if (options.folder) uploadOptions.folder = options.folder
    if (options.fileName) uploadOptions.public_id = options.fileName
    if (options.transformation) uploadOptions.transformation = options.transformation

    try {
      const result = await cloudinary.uploader.upload(dataURI, uploadOptions)
      return {
        url: result.secure_url,
        publicId: result.public_id,
      }
    } catch (error) {
      console.error('Erreur Cloudinary:', error)
      throw new Error(`Échec d'upload vers Cloudinary: ${error.message}`)
    }
  }

  public async deleteImage(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId)
      return result.result === 'ok'
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      throw new Error(`Échec de la suppression: ${error.message}`)
    }
  }

  public getPublicIdFromUrl(url: string): string | null {
    if (!url) return null
    const regex = /\/v\d+\/(.+)(?:\.\w+)?$/
    const match = url.match(regex)
    return match ? match[1] : null
  }
}
