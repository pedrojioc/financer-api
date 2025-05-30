import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Loan } from './loan.entity'
import { NumberColumnTransformer } from 'src/shared/transformers/number-column-transformer'
import { User } from 'src/users/entities/user.entity'

@Entity({ name: 'deleted_installments' })
export class DeletedInstallment {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'installment_id' })
  installmentId: number

  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  User: User
  @Column({ name: 'user_id', comment: 'Usuario que elimino el registro' })
  userId: number

  @ManyToOne(() => Loan, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'loan_id' })
  loan: Loan
  @Column({ name: 'loan_id' })
  loanId: number

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

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
