import {
  IrisConnectionException,
  IrisException,
  IrisNoMatchException,
} from '#exceptions/iris_exception'
import env from '#start/env'
import { ScanGradeIrisResponse, ScanAnalyseIrisResponse } from '#types/iris_type'

export default class IrisApiClient {
  private readonly baseUrl = env.get('IRIS_API_BASE_URL')

  public async scanCard(formData: FormData, threshold?: number): Promise<ScanAnalyseIrisResponse> {
    try {
      const url = new URL(`${this.baseUrl}/images/analyze`)
      if (threshold !== undefined) url.searchParams.set('threshold', String(threshold))
      const response = await fetch(url.toString(), {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new IrisConnectionException()
      }

      const data = (await response.json()) as ScanAnalyseIrisResponse

      if (!data.cards || data.cards.length === 0) {
        throw new IrisNoMatchException()
      }

      return data
    } catch (error) {
      if (error instanceof IrisException) {
        throw error
      }
      throw new IrisException()
    }
  }

  public async gradeCard(formData: FormData): Promise<ScanGradeIrisResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/images/grade`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new IrisConnectionException()
      }

      const data = (await response.json()) as ScanGradeIrisResponse

      if (!data.cards || data.cards.length === 0) {
        throw new IrisNoMatchException()
      }

      return data
    } catch (error) {
      if (error instanceof IrisException) {
        throw error
      }
      throw new IrisException()
    }
  }
}
