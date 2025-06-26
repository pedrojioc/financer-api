import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ManyToOne,
	JoinColumn,
} from 'typeorm'
import { Loan } from '../../../entities/loan.entity'
import { NumberColumnTransformer } from 'src/shared/transformers/number-column-transformer'

@Entity('loan_balance_snapshots')
export class LoanBalanceSnapshot {
	@PrimaryGeneratedColumn()
	id: number

	@ManyToOne(() => Loan, (loan) => loan.balanceSnapshots, { onDelete: 'RESTRICT' })
	@JoinColumn({ name: 'loan_id' })
	loan: Loan
	@Column({ name: 'loan_id' })
	loanId: number

	@Column({ type: 'decimal', precision: 15, scale: 2, transformer: new NumberColumnTransformer() })
	debt: number

	@Column({
		name: 'overdue_interest',
		type: 'decimal',
		precision: 15,
		scale: 2,
		transformer: new NumberColumnTransformer(),
	})
	overdueInterest: number

	@Column({ name: 'interest_rate', type: 'decimal', precision: 15, scale: 2 })
	interestRate: number

	@Column({ name: 'snapshot_date', type: 'date' })
	snapshotDate: Date

	@CreateDateColumn()
	createdAt: Date

	@UpdateDateColumn()
	updatedAt: Date
}
