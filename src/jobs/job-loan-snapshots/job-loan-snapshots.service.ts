import { Injectable } from '@nestjs/common'
import { LoanSnapshotsService } from 'src/loans/modules/loan-history/services/loan-snapshots.service'
import { LOAN_STATES } from 'src/loans/shared/constants'
import { InstallmentsService } from 'src/loans/modules/installments/installments.service'
import { LoanManagementService } from 'src/loans/modules/loans-management/loans-management.service'

@Injectable()
export class JobLoanSnapshotsService {
	constructor(
		private loanManagementService: LoanManagementService,
		private loanSnapshotsService: LoanSnapshotsService,
		private installmentsService: InstallmentsService,
	) {}

	async runLoanSnapshots() {
		const loans = await this.loanManagementService.getLoansByState(LOAN_STATES.IN_PROGRESS)
		for (const loan of loans) {
			const overdueInterest = await this.installmentsService.getOverdueInterestAmount(loan.id)
			await this.loanSnapshotsService.create({
				loanId: loan.id,
				debt: loan.debt,
				overdueInterest,
				interestRate: loan.interestRate,
				snapshotDate: new Date(),
			})
		}
		return true
	}
}
