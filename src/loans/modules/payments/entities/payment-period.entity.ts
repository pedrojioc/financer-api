import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity({ name: 'payment_periods' })
export class PaymentPeriod {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: '100' })
  name: string

  @Column({ type: 'int' })
  days: number

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
