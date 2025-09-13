import { inject } from '@adonisjs/core'
import GradeService from '#services/grade_service'
import CertificateService from '#services/certificate_service'
import { ScanGradeDTO } from '#types/iris_type'
import CertificateMapper from '#mappers/certificate_mapper'
import MeService from '#services/me_service'

@inject()
export default class CertificationProcessor {
  constructor(
    private gradeService: GradeService,
    private certificateService: CertificateService,
    private meService: MeService
  ) {}

  /**
   * Process cards with ownership information.
   */
  public async processCertification(userId: string, cardId: string, scanGradeDTO: ScanGradeDTO) {
    const grade = await this.gradeService.getGradeByScore(scanGradeDTO.globaleRating)
    const certification = await this.certificateService.createCertificate(
      userId,
      cardId,
      grade.id,
      scanGradeDTO
    )
    await this.meService.decrementGradingTokenCount(userId)

    return CertificateMapper.toCertificationOutputDTO(certification, grade)
  }
}
