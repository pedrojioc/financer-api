import { Controller, Get } from '@nestjs/common'
import { LoanReportsService } from './loan-reports.service'

@Controller('loan-reports')
export class LoanReportsController {
  constructor(private loanReportService: LoanReportsService) {}

  @Get('dashboard')
  async dashboard() {
    const capital = await this.loanReportService.getCurrentCapital()
    const pendingInterest = await this.loanReportService.getPendingInterest()
    const currentLoans = await this.loanReportService.countCurrentLoans()
    const unpaidInterestByAdvisor = await this.loanReportService.getUnpaidInterestGroupedByAdvisor()
    const loansAmountByAdvisor = await this.loanReportService.getLoansAmountGroupedByAdvisor()
    const overdueLoans = await this.loanReportService.countOverdueLoans()

    return {
      capital,
      pendingInterest,
      currentLoans,
      loansAmountByAdvisor,
      unpaidInterestByAdvisor,
      overdueLoans,
    }
  }
}
