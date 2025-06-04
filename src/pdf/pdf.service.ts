import { Injectable, Logger } from '@nestjs/common'
import * as fs from 'fs'
import * as path from 'path'
import * as handlebars from 'handlebars'
import * as puppeteer from 'puppeteer'

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name)
  compileTemplate(templateName: string, context: any): string {
    let templatePath
    // Try to find the template in the dist directory first
    const distPath = path.join(
      process.cwd(),
      'dist',
      'src',
      'pdf',
      'templates',
      `${templateName}.hbs`,
    )
    const srcPath = path.join(process.cwd(), 'src', 'pdf', 'templates', `${templateName}.hbs`)

    // Check if template exists in either location
    if (fs.existsSync(distPath)) {
      templatePath = distPath
    } else if (fs.existsSync(srcPath)) {
      templatePath = srcPath
    } else {
      throw new Error(`Template ${templateName}.hbs not found in either ${distPath} or ${srcPath}`)
    }

    // Read and compile template
    const templateContent = fs.readFileSync(templatePath, 'utf8')
    const template = handlebars.compile(templateContent)
    return template(context)
  }

  async generatePdf(templateName: string, context: any): Promise<Buffer> {
    const html = this.compileTemplate(templateName, context)

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    const page = await browser.newPage()
    await page.setContent(html)

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '2.54cm', right: '2.54cm', bottom: '2.54cm', left: '2.54cm' },
    })

    await browser.close()

    return Buffer.from(pdf)
  }
}
