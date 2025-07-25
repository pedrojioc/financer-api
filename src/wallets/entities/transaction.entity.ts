import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm'
import { TransactionType } from './transaction-type.entity'
import { Wallet } from './wallet.entity'
import { Loan } from '../../loans/entities/loan.entity'
import { NumberColumnTransformer } from 'src/shared/transformers/number-column-transformer'
import { TransactionCategory } from './transaction-category.entity'

@Entity({ name: 'transactions' })
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => TransactionType, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'transaction_type_id' })
  transactionType: TransactionType
  @Column({ name: 'transaction_type_id', nullable: false })
  transactionTypeId: number

  @ManyToOne(() => TransactionCategory, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'transaction_category_id' })
  transactionCategory: TransactionCategory
  @Column({ name: 'transaction_category_id', nullable: true })
  transactionCategoryId: number

  @ManyToOne(() => Wallet, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet
  @Column({ name: 'wallet_id', nullable: false })
  walletId: number

  @ManyToOne(() => Loan, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'loan_id' })
  loan: Loan
  @Column({ name: 'loan_id', nullable: true })
  loanId: number

  @Column({
    name: 'flow_type',
    type: 'enum',
    enum: ['INFLOW', 'OUTFLOW'],
    nullable: false,
    comment: 'Direction of the transaction',
  })
  flowType: 'INFLOW' | 'OUTFLOW'

  @Column({ name: 'description', nullable: false })
  description: string

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    transformer: new NumberColumnTransformer(),
  })
  amount: number

  @Column({
    name: 'previous_balance',
    type: 'decimal',
    precision: 15,
    scale: 2,
    transformer: new NumberColumnTransformer(),
  })
  previousBalance: number

  @Column({
    name: 'new_balance',
    type: 'decimal',
    precision: 15,
    scale: 2,
    transformer: new NumberColumnTransformer(),
  })
  newBalance: number

  @Column({ name: 'date', type: 'date' })
  date: Date

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date
}
