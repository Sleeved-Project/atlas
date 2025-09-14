import { ScanCardInfoDTO, ScanGradeDTO } from '#types/iris_type'
import IrisApiClient from '../clients/iris_api_client.js'
import IrisMapper from '#mappers/iris_mapper'
import FileService from '#services/file_service'
import { inject } from '@adonisjs/core'

@inject()
export default class ScanService {
  private irisApiClient: IrisApiClient

  constructor(private fileService: FileService) {
    this.irisApiClient = new IrisApiClient()
  }

  public async getAnalyseResults(
    filePath: string,
    fileName: string,
    fileType: string | undefined
  ): Promise<ScanCardInfoDTO[]> {
    try {
      const formData = this.fileService.createFormDataWithFile(filePath, fileName, fileType)

      const scanAnalyseResponse = await this.irisApiClient.scanCard(formData)

      return IrisMapper.scanAnalyseIrisResponseToScanCardInfoDTO(scanAnalyseResponse)
    } catch (error) {
      throw error
    }
  }

  public async getIdentifyResult(
    filePath: string,
    fileName: string,
    fileType: string | undefined
  ): Promise<ScanCardInfoDTO | null> {
    try {
      const formData = this.fileService.createFormDataWithFile(filePath, fileName, fileType)

      const scanAnalyseResponse = await this.irisApiClient.scanCard(formData)

      return IrisMapper.scanAnalyseIrisResponseToIdentifyDTO(scanAnalyseResponse)
    } catch (error) {
      throw error
    }
  }

  public async getGradingResults(
    filePath: string,
    fileName: string,
    fileType: string | undefined
  ): Promise<ScanGradeDTO> {
    try {
      const formData = this.fileService.createFormDataWithFile(filePath, fileName, fileType)

      const scanGradingResponse = await this.irisApiClient.gradeCard(formData)

      return IrisMapper.scanGradeIrisResponseToGradeInputDTO(scanGradingResponse)
    } catch (error: any) {
      throw error
    }
  }
}
