import { Injectable } from '@nestjs/common'
import { LoanBalanceSnapshot } from './entities/loan-balance-snapshot.entity'
import { CreateLoanSnapshotDto } from './dtos/create-loan-snapshot.dto'
import { LoanSnapshotsService } from './services/loan-snapshots.service'

@Injectable()
export class LoanHistoryService {
	constructor(private loanSnapshotsService: LoanSnapshotsService) {}

	async createBalanceSnapshot(
		loanId: number,
		createSnapshotDto: CreateLoanSnapshotDto,
	): Promise<LoanBalanceSnapshot> {
		return this.loanSnapshotsService.create(createSnapshotDto)
	}

	async getLoanBalanceHistory(loanId: number): Promise<LoanBalanceSnapshot[]> {
		return this.loanSnapshotsService.getLoanBalanceHistory(loanId)
	}

	async getLatestBalanceSnapshot(loanId: number): Promise<LoanBalanceSnapshot | null> {
		return this.loanSnapshotsService.getLatestBalanceSnapshot(loanId)
	}

	async updateLoanBalanceSnapshot(
		id: number,
		updateData: Partial<CreateLoanSnapshotDto>,
	): Promise<LoanBalanceSnapshot> {
		return this.loanSnapshotsService.update(id, updateData)
	}

	async deleteLoanBalanceSnapshot(id: number): Promise<void> {
		return this.loanSnapshotsService.delete(id)
	}
}
