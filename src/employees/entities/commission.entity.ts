import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import { Employee } from './employee.entity'
import { NumberColumnTransformer } from 'src/shared/transformers/number-column-transformer'
import { Payment } from 'src/loans/entities/payments.entity'
import { CommissionInstallment } from './commission-installment.entity'

@Entity({ name: 'commissions' })
export class Commission {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => Employee, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee
  @Column({ name: 'employee_id', nullable: false })
  employeeId: number

  @ManyToOne(() => Payment, (payment) => payment.commissions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'payment_id' })
  payment: Payment
  @Column({ name: 'payment_id', nullable: false })
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
