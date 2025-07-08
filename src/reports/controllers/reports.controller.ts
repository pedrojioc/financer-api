import { Controller, Get } from '@nestjs/common'
import { ReportsService } from '../services/reports.service'

@Controller('reports')
export class ReportsController {
	constructor(private readonly reportService: ReportsService) {}

	@Get('profit-history')
	async profitHistory() {
		return await this.reportService.profitHistory()
	}

	@Get('current-month-profit')
	async getCurrentMonthProfit() {
		return await this.reportService.getCurrentMonthProfit()
	}
}
