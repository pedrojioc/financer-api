import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { LoanBalanceSnapshot } from '../entities/loan-balance-snapshot.entity'
import { CreateLoanSnapshotDto } from '../dtos/create-loan-snapshot.dto'
import { Loan } from '../../../entities/loan.entity'

@Injectable()
export class LoanSnapshotsService {
	constructor(
		@InjectRepository(LoanBalanceSnapshot)
		private loanBalanceSnapshotRepository: Repository<LoanBalanceSnapshot>,
	) {}

	async create(createSnapshotDto: CreateLoanSnapshotDto): Promise<LoanBalanceSnapshot> {
		const snapshot = this.loanBalanceSnapshotRepository.create(createSnapshotDto)

		return this.loanBalanceSnapshotRepository.save(snapshot)
	}

	async getLoanBalanceHistory(loanId: number): Promise<LoanBalanceSnapshot[]> {
		return this.loanBalanceSnapshotRepository.find({
			where: { loanId },
			order: { snapshotDate: 'DESC' },
			relations: ['loan'],
		})
	}

	async getLatestBalanceSnapshot(loanId: number): Promise<LoanBalanceSnapshot | null> {
		return this.loanBalanceSnapshotRepository.findOne({
			where: { loanId },
			order: { snapshotDate: 'DESC' },
			relations: ['loan'],
		})
	}

	async update(
		id: number,
		updateData: Partial<CreateLoanSnapshotDto>,
	): Promise<LoanBalanceSnapshot> {
		const snapshot = await this.loanBalanceSnapshotRepository.findOne({
			where: { id },
			relations: ['loan'],
		})

		if (!snapshot) {
			throw new Error(`Loan balance snapshot with id ${id} not found`)
		}

		Object.assign(snapshot, updateData)
		return this.loanBalanceSnapshotRepository.save(snapshot)
	}

	async delete(id: number): Promise<void> {
		const snapshot = await this.loanBalanceSnapshotRepository.findOne({
			where: { id },
			relations: ['loan'],
		})

		if (!snapshot) {
			throw new Error(`Loan balance snapshot with id ${id} not found`)
		}

		await this.loanBalanceSnapshotRepository.remove(snapshot)
	}
}
