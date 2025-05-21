import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import { Employee } from './employee.entity'
import { NumberColumnTransformer } from 'src/shared/transformers/number-column-transformer'
import { Payment } from 'src/loans/entities/payments.entity'
import { CommissionInstallment } from './commission-installment.entity'
import { Installment } from 'src/loans/entities/installment.entity'

@Entity({ name: 'commissions' })
export class Commission {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => Employee, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee
  @Column({ name: 'employee_id', nullable: false })
  employeeId: number

  @OneToOne(() => Installment, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'installment_id' })
  installment: Installment

  @Column({ name: 'installment_id' })
  installmentId: number

  @ManyToOne(() => Payment, (payment) => payment.commissions, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'payment_id' })
  payment: Payment
  @Column({ name: 'payment_id', nullable: true })
  paymentId: number

  @Column({
    name: 'interest_amount',
    type: 'decimal',
    precision: 15,
    scale: 2,
    transformer: new NumberColumnTransformer(),
  })
  interestAmount: number

  @Column({ type: 'decimal', precision: 15, scale: 2, transformer: new NumberColumnTransformer() })
  amount: number

  @Column({ type: 'int' })
  rate: number

  @Column({ name: 'is_paid', type: 'tinyint', default: 0 })
  isPaid: boolean

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @OneToMany(
    () => CommissionInstallment,
    (commissionsInstallments) => commissionsInstallments.commission,
  )
  commissionsInstallments: CommissionInstallment[]
}
