import { ScanCardInfoDTO } from '#types/iris_type'
import fs from 'node:fs'
import IrisApiClient from '../clients/iris_api_client.js'
import IrisMapper from '#mappers/iris_mapper'

export default class ScanService {
  private irisApiClient: IrisApiClient

  constructor() {
    this.irisApiClient = new IrisApiClient()
  }
  public async getAnalyseResults(
    filePath: string,
    fileName: string,
    fileType: string | undefined
  ): Promise<ScanCardInfoDTO[]> {
    try {
      const formData = new FormData()

      const fileStream = fs.readFileSync(filePath)
      const localFile = new File([fileStream], fileName, {
        type: fileType || 'application/octet-stream',
      })

      formData.append('file', localFile)

      const scanAnalyseResponse = await this.irisApiClient.scanCard(formData)

      return IrisMapper.scanAnalyseIrisResponseToScanCardInfoDTO(scanAnalyseResponse)
    } catch (error) {
      throw error
    } finally {
      fs.rmSync(filePath)
    }
  }
}
