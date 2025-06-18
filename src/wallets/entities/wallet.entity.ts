import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Transaction } from './transaction.entity'

@Entity({ name: 'wallets' })
export class Wallet {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'name', nullable: false })
  name: string

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number

  @Column({ name: 'description', nullable: true })
  description: string

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date

  @OneToMany(() => Transaction, (transaction) => transaction.wallet)
  transactions: Transaction[]
}
