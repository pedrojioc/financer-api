import { Loan } from '../../../entities/loan.entity'
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity({ name: 'refinancing' })
export class Refinancing {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => Loan, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'origin_loan_id' })
  originLoan: Loan
  @Column({ name: 'origin_loan_id' })
  originLoanId: number

  @ManyToOne(() => Loan, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'new_loan_id' })
  newLoan: Loan
  @Column({ name: 'new_loan_id' })
  newLoanId: number

  @Column({ name: 'previous_amount', type: 'decimal', precision: 15, scale: 2 })
  previousAmount: number

  @Column({ name: 'new_amount', type: 'decimal', precision: 15, scale: 2 })
  newAmount: number

  @Column({ name: 'refinancing_date', type: 'date' })
  refinancingDate: Date

  @Column({ type: 'text', nullable: true })
  note: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
