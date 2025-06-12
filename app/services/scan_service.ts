import fs from 'node:fs'

interface ScanAnalyseResponse {
  message: string
  cards: ScanAnalyseCard[]
}

interface ScanAnalyseCard {
  card_hash: string
  card_index: number
  is_similar: boolean
  similarity_percentage: number
  matched_card_id: string
  matched_card_name: string
  top_n_matches: ScanAnalyseCardMatch[]
}

interface ScanAnalyseCardMatch {
  card_id: string
  card_name: string
  similarity_percentage: number
  hamming_distance: number
}

export interface ScanCardInfoDTO {
  id: string
  similarity: number
}

export default class ScanService {
  public async getAnalyseResults(
    filePath: string,
    fileName: string,
    fileType: string | undefined
  ): Promise<ScanCardInfoDTO[] | null> {
    try {
      // Création d'un FormData pour l'envoi en multipart/form-data
      const formData = new FormData()

      // Lecture du fichier temporaire et ajout au formData
      const fileStream = fs.readFileSync(filePath)
      const localFile = new File([fileStream], fileName, {
        type: fileType || 'application/octet-stream',
      })

      formData.append('file', localFile)

      // Appel à l'API externe
      const response = await fetch('http://iris-api:8083/api/v1/images/analyze', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`)
      }

      const data = (await response.json()) as ScanAnalyseResponse

      const scanResults: ScanCardInfoDTO[] = data.cards[0].top_n_matches.map((match) => ({
        id: match.card_id,
        similarity: match.similarity_percentage,
      }))

      return scanResults
    } catch (error) {
      console.error("Erreur lors de l'analyse du scan:", error)
      return null
    } finally {
      fs.rmSync(filePath)
    }
  }
}
