import { MultipartFile } from '@adonisjs/core/bodyparser'
import { cuid } from '@adonisjs/core/helpers'
import app from '@adonisjs/core/services/app'
import env from '#start/env'
import { inject } from '@adonisjs/core'
import fs from 'node:fs'
import { FileUploadException } from '#exceptions/file_upload_exception'

@inject()
export default class FileService {
  private readonly uploadDir: string
  private filesToClean: Set<string>

  constructor() {
    this.uploadDir = env.get('UPLOAD_DIR')
    this.filesToClean = new Set()
  }

  async saveFile(file: MultipartFile): Promise<string> {
    const fileName = `${cuid()}.${file.extname}`

    await file.move(app.makePath(this.uploadDir), {
      name: fileName,
    })

    if (!file.filePath) {
      throw new FileUploadException()
    }

    this.filesToClean.add(file.filePath)
    return file.filePath
  }

  cleanup() {
    for (const filePath of this.filesToClean) {
      if (fs.existsSync(filePath)) {
        fs.rmSync(filePath)
      }
    }
    this.filesToClean.clear()
  }
}
