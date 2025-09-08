export interface UploadOptions {
  folder?: string
  fileName?: string
  transformation?: any
}

export interface UploadResult {
  url: string
  publicId: string
}

export interface MediaStorage {
  uploadBuffer(buffer: Buffer, options?: UploadOptions): Promise<UploadResult>
  deleteImage(publicId: string): Promise<boolean>
  getPublicIdFromUrl(url: string): string | null
}
