import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Wallet } from './wallet.entity'

@Entity({ name: 'transaction_categories' })
export class TransactionCategory {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'name', nullable: false })
  name: string

  @Column({ name: 'description', nullable: true })
  description: string

  @Column({ name: 'icon', nullable: true })
  icon: string

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date

  @ManyToMany(() => Wallet, (wallet) => wallet.transactionCategories)
  wallets: Wallet[]
}
