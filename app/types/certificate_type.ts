export type CertificationOutputDTO = {
  id: string
  globalRating: string
  centeringRating: string
  cornerRating: string
  edgeRating: string
  surfaceRating: string
  certifiedAt: string | null
  grade: {
    label: string
    description: string
    code: string
  }
}
