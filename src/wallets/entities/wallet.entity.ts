import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Transaction } from './transaction.entity'
import { NumberColumnTransformer } from 'src/shared/transformers/number-column-transformer'
import { TransactionCategory } from './transaction-category.entity'

@Entity({ name: 'wallets' })
export class Wallet {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'name', nullable: false })
  name: string

  @Column({ type: 'decimal', precision: 15, scale: 2, transformer: new NumberColumnTransformer() })
  balance: number

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

  @ManyToMany(() => TransactionCategory, (transactionCategory) => transactionCategory.wallets)
  @JoinTable({
    name: 'wallet_transaction_categories',
    joinColumn: { name: 'wallet_id' },
    inverseJoinColumn: { name: 'transaction_category_id' },
  })
  transactionCategories: TransactionCategory[]
}
