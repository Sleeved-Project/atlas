import PDFDocument from 'pdfkit'
import QRCode from 'qrcode'
import { inject } from '@adonisjs/core'

@inject()
export default class ShippingLabelService {
  private readonly BLACK = '#000000'
  private readonly GRAY = '#64748b'

  public async generateShippingLabel(
    from: {
      name: string
      address: string
      city: string
      zipcode: string
      country: string
    },
    to: {
      name: string
      address: string
      city: string
      zipcode: string
      country: string
    },
    trackingNumber: string,
    orderId: string
  ): Promise<Buffer> {
    const qrCodeDataUrl = await QRCode.toDataURL(trackingNumber)
    const doc = new PDFDocument({
      size: 'A6',
      margin: 20,
    })

    const chunks: Buffer[] = []
    doc.on('data', (chunk) => chunks.push(chunk))

    // Bordure noire
    this.drawBox(doc, 15, 15, doc.page.width - 30, doc.page.height - 30)

    // Logo en haut à gauche
    const logoPath = 'resources/images/logo.png'
    doc.image(logoPath, 25, 25, { width: 60 })

    doc
      .save()
      .moveTo(30, 100)
      .lineTo(doc.page.width - 30, 100)
      .strokeColor(this.GRAY)
      .lineWidth(1)
      .stroke()
      .restore()
      .moveDown()

    // Titre et sous-titre centrés sous le logo
    doc
      .fontSize(16)
      .fillColor(this.BLACK)
      .font('Helvetica-Bold')
      .text('SHIPPING LABEL', 90, 30)
      .moveDown(0.5)
      .fontSize(10)
      .fillColor(this.GRAY)
      .font('Helvetica')
      .text(`Order #${orderId}`)
      .moveDown()

    // Section expéditeur
    doc
      .fontSize(10)
      .fillColor(this.GRAY)
      .font('Helvetica-Bold')
      .text('FROM:', 30, 120)
      .font('Helvetica')
      .fillColor('black')
      .fontSize(9)
      .text(from.name)
      .text(from.address)
      .text(`${from.zipcode} ${from.city}`)
      .text(from.country)
      .moveDown()

    // Section destinataire
    doc
      .fontSize(10)
      .fillColor(this.GRAY)
      .font('Helvetica-Bold')
      .text('TO:', 30)
      .font('Helvetica')
      .fillColor('black')
      .fontSize(9)
      .text(to.name)
      .text(to.address)
      .text(`${to.zipcode} ${to.city}`)
      .text(to.country)
      .moveDown()

    doc
      .save()
      .moveTo(30, 255)
      .lineTo(doc.page.width - 30, 255)
      .strokeColor(this.GRAY)
      .lineWidth(1)
      .stroke()
      .restore()
      .moveDown()

    // Placement du QR code
    const qrX = doc.page.width - 150 // Position X à droite
    const qrY = 115 // Même hauteur que les adresses
    doc.image(Buffer.from(qrCodeDataUrl.split(',')[1], 'base64'), qrX, qrY, {
      fit: [120, 120],
    })

    // Section tracking avec fond coloré
    this.drawTrackingBox(doc, trackingNumber)

    // Footer
    doc
      .moveDown(1)
      .fontSize(8)
      .fillColor(this.GRAY)
      .text('Please handle with care - Trading Card Inside', { align: 'center' })

    doc.end()

    return new Promise((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(chunks))
      })
    })
  }

  private drawBox(doc: PDFKit.PDFDocument, x: number, y: number, width: number, height: number) {
    doc
      .save()
      .strokeColor(this.BLACK) // Changé en noir
      .lineWidth(2)
      .rect(x, y, width, height)
      .stroke()
      .restore()
  }

  private drawTrackingBox(doc: PDFKit.PDFDocument, trackingNumber: string) {
    const boxHeight = 40
    const boxWidth = doc.page.width - 60 // Ajusté pour plus de largeur
    const boxX = 30
    const boxY = doc.y + 20

    doc.save().rect(boxX, boxY, boxWidth, boxHeight).fillColor('#f8fafc').fill().restore()

    doc
      .fontSize(10)
      .fillColor(this.GRAY)
      .font('Helvetica-Bold')
      .text('TRACKING NUMBER:', boxX + 10, boxY + 10)
      .font('Helvetica')
      .fillColor('black')
      .fontSize(12)
      .text(trackingNumber, boxX + 10, boxY + 22)
  }
}
