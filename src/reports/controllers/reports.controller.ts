import { Controller, Get, Query } from '@nestjs/common'
import { ReportsService } from '../services/reports.service'

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportService: ReportsService) {}

  @Get('profit-history')
  async profitHistory() {
    return await this.reportService.profitHistory()
  }

  @Get('month-profit')
  async getMonthProfit(@Query('date') date: string) {
    return await this.reportService.getMonthProfit(date)
  }
}
