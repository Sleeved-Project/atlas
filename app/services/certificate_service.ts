import Certificate from '#models/certificate'
import { ScanGradeDTO } from '#types/iris_type'

export default class CertificateService {
  public async getCertificateByCardIdCertifyedByAndId(
    certifiedById: string,
    cardId: string,
    certificateId: string
  ): Promise<Certificate> {
    return await Certificate.findByOrFail({
      id: certificateId,
      certifiedById,
      cardId,
    })
  }

  public async createCertificate(
    certifiedById: string,
    cardId: string,
    gradeId: string,
    scanGradeDTO: ScanGradeDTO
  ): Promise<Certificate> {
    return await Certificate.create({
      certifiedById,
      cardId,
      gradeId,
      globalRating: scanGradeDTO.globalRating,
      centeringRating: scanGradeDTO.centerRating,
      cornerRating: scanGradeDTO.cornerRating,
      edgeRating: scanGradeDTO.edgeRating,
      surfaceRating: scanGradeDTO.surfaceRating,
    })
  }
}
