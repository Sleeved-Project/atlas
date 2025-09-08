import fs from 'node:fs/promises'
import type { MultipartFile } from '@adonisjs/core/bodyparser'

export default class FileService {
  /**
   * Read a temporary file and returns its content as a Buffer
   */
  public async readFileToBuffer(file: MultipartFile): Promise<Buffer | null> {
    if (!file || !file.isValid || !file.tmpPath) {
      return null
    }

    try {
      return await fs.readFile(file.tmpPath)
    } catch (error) {
      console.error('Error reading file:', error)
      throw new Error(`Failed to read file: ${error.message}`)
    }
  }

  /**
   * Delete a temporary file
   */
  public async cleanupTempFile(file: MultipartFile): Promise<void> {
    if (file && file.tmpPath) {
      try {
        await fs.unlink(file.tmpPath).catch(() => {})
      } catch (error) {
        console.error('Error deleting temporary file:', error)
      }
    }
  }
}
