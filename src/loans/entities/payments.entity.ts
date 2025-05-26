import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm'
import { NumberColumnTransformer } from 'src/shared/transformers/number-column-transformer'
import { PaymentMethod } from 'src/payment-methods/entities/payment-method.entity'
import { Installment } from './installment.entity'
import { Loan } from './loan.entity'
import { Commission } from 'src/employees/entities/commission.entity'

@Entity({ name: 'payments' })
export class Payment {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => Loan, (loan) => loan.payments, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'loan_id' })
  loan: Loan
  @Column({ name: 'loan_id', nullable: false })
  loanId: number

  @ManyToOne(() => PaymentMethod, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'payment_method_id' })
  paymentMethod: PaymentMethod

  @Column({ name: 'payment_method_id', nullable: true })
  paymentMethodId: number

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    comment: 'Monto abonado a capital',
    transformer: new NumberColumnTransformer(),
  })
  capital: number

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    comment:
      'Intereses totales cancelados (en caso de que se pague más de una cuota, será la suma de los intereses de dichas cuotas)',
    transformer: new NumberColumnTransformer(),
  })
  interest: number

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    comment: 'Monto total abonado',
    transformer: new NumberColumnTransformer(),
  })
  total: number

  @Column({ type: 'date' })
  date: Date

  @Column({ name: 'is_received', type: 'boolean', default: false })
  isReceived: boolean

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @ManyToMany(() => Installment, (installment) => installment.payments)
  @JoinTable({
    name: 'installment_payments',
    joinColumn: { name: 'payment_id' },
    inverseJoinColumn: { name: 'installment_id' },
  })
  installments: Installment[]

  @OneToMany(() => Commission, (commission) => commission.payment)
  commissions: Commission[]
}
