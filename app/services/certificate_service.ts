import Certificate from '#models/certificate'

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
}
