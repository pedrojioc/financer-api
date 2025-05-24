import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm'

import { Customer } from '../../customers/entities/customer.entity'
import { Employee } from '../../employees/entities/employee.entity'
import { PaymentPeriod } from './payment-period.entity'
import { LoanState } from './loan-state.entity'
import { NumberColumnTransformer } from 'src/shared/transformers/number-column-transformer'
import { InstallmentType } from '../modules/installments/entities/installment-type.entity'
import { Refinancing } from '../modules/refinancing/entities/refinancing.entity'
import { Payment } from './payments.entity'

@Entity({ name: 'loans' })
export class Loan {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => Customer, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer
  @Column({ name: 'customer_id' })
  customerId: number

  @ManyToOne(() => Employee, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee
  @Column({ name: 'employee_id' })
  employeeId: number

  @ManyToOne(() => PaymentPeriod, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'payment_period_id' })
  paymentPeriod: PaymentPeriod

  @Column({ name: 'payment_period_id' })
  paymentPeriodId: number

  @ManyToOne(() => LoanState, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'loan_state_id' })
  loanState: LoanState
  @Column({ name: 'loan_state_id' })
  loanStateId: number

  @ManyToOne(() => InstallmentType, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'installment_type_id' })
  installmentType: InstallmentType
  @Column({ name: 'installment_type_id', nullable: true })
  installmentTypeId: number

  @Column({ type: 'decimal', precision: 15, scale: 2, transformer: new NumberColumnTransformer() })
  amount: number

  @Column({ name: 'interest_rate', type: 'decimal', precision: 10, scale: 2 })
  interestRate: number

  @Column({ type: 'decimal', precision: 15, scale: 2, transformer: new NumberColumnTransformer() })
  debt: number

  @Column({ type: 'int', default: 0 })
  installmentsNumber: number

  @Column({ name: 'installments_paid', type: 'int', default: 0 })
  installmentsPaid: number

  @Column({
    name: 'current_installment_number',
    type: 'int',
    default: 0,
    transformer: new NumberColumnTransformer(),
  })
  currentInstallmentNumber: number

  @Column({ type: 'int', name: 'days_late', default: 0 })
  daysLate: number

  @Column({
    name: 'current_interest',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    comment: 'Current interest generated since the last payment date',
    transformer: new NumberColumnTransformer(),
  })
  currentInterest: number

  @Column({
    name: 'total_interest_paid',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    transformer: new NumberColumnTransformer(),
  })
  totalInterestPaid: number

  @Column({
    name: 'commissions_paid',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
    transformer: new NumberColumnTransformer(),
  })
  commissionsPaid: number

  @Column({
    name: 'commission_rate',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: new NumberColumnTransformer(),
  })
  commissionRate: number

  @Column({ name: 'start_at', type: 'datetime' })
  startAt: Date

  @Column({ name: 'end_at', type: 'datetime' })
  endAt: Date

  @Column({ name: 'payment_day', type: 'int', nullable: false })
  paymentDay: number

  @Column({ name: 'last_interest_payment', type: 'date', nullable: true })
  lastInterestPayment: Date

  @Column({ name: 'is_notifications_paused', type: 'boolean', default: false })
  isNotificationsPaused: boolean

  @Column({ name: 'pause_notifications_until', type: 'date', nullable: true })
  pauseNotificationsUntil: Date

  @Column({ name: 'last_notification_sent', type: 'date', nullable: true })
  lastNotificationSent: Date

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @ManyToOne(() => Loan, (loan) => loan.refinancing, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'parent_loan_id' })
  parentLoan: Loan
  @Column({ name: 'parent_loan_id', nullable: true })
  parentLoanId: number

  @OneToMany(() => Payment, (payment) => payment.loan)
  payments: Payment[]

  @OneToMany(() => Refinancing, (refinancing) => refinancing.originLoan)
  refinancing: Refinancing[]
}
