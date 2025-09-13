import Certificate from '#models/certificate'
import Grade from '#models/grade'
import { CertificationOutputDTO } from '#types/certificate_type'

export default class CertificateMapper {
  public static toCertificationOutputDTO(
    certificate: Certificate,
    grade: Grade
  ): CertificationOutputDTO {
    return {
      id: certificate.id,
      globalRating: certificate.globalRating.toFixed(1),
      centeringRating: certificate.centeringRating.toFixed(1),
      cornerRating: certificate.cornerRating.toFixed(1),
      edgeRating: certificate.edgeRating.toFixed(1),
      surfaceRating: certificate.surfaceRating.toFixed(1),
      certifiedAt: certificate.certifiedAt.toISODate(),
      grade: {
        label: grade.label,
        description: grade.description,
        code: grade.code,
      },
    }
  }
}
