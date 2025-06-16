import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import { Loan } from 'src/loans/entities/loan.entity'
import { InstallmentState } from './installment-state.entity'
import { NumberColumnTransformer } from 'src/shared/transformers/number-column-transformer'
import { Payment } from 'src/loans/modules/payments/entities/payments.entity'
import { CommissionInstallment } from 'src/employees/entities/commission-installment.entity'

@Entity({ name: 'installments' })
export class Installment {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => Loan, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'loan_id' })
  loan: Loan
  @Column({ name: 'loan_id' })
  loanId: number

  @ManyToOne(() => InstallmentState, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'installment_state_id' })
  installmentState: InstallmentState

  @Column({ name: 'installment_state_id' })
  installmentStateId: number

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  debt: number

  @Column({ name: 'starts_on', type: 'date', nullable: true })
  startsOn: Date

  @Column({ name: 'payment_deadline', type: 'date', nullable: true })
  paymentDeadline: Date

  @Column({ type: 'int', default: 0 })
  days: number

  @Column({ name: 'installment_number', type: 'int', default: 0 })
  installmentNumber: number

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    comment: 'Abono que se hace a la deuda capital',
    transformer: new NumberColumnTransformer(),
  })
  capital: number

  @Column({ type: 'decimal', precision: 15, scale: 2, transformer: new NumberColumnTransformer() })
  interest: number

  @Column({
    name: 'interest_piad',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    comment: 'Pago realizado a intereses',
    transformer: new NumberColumnTransformer(),
  })
  interestPaid: number

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  total: number

  @Column({ name: 'is_prorate', type: 'boolean', nullable: false, default: false })
  isProrate: boolean

  @Column({ name: 'payment_date', type: 'date', nullable: true })
  paymentDate: Date

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @ManyToMany(() => Payment, (payment) => payment.installments)
  payments: Payment[]

  @OneToMany(
    () => CommissionInstallment,
    (commissionsInstallments) => commissionsInstallments.installment,
  )
  commissionsInstallments: CommissionInstallment[]
}
