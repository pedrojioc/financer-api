import { Module } from '@nestjs/common'
import { WalletService } from './services/wallet.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Wallet } from './entities/wallet.entity'
import { Transaction } from './entities/transactions.entity'
import { TransactionType } from './entities/transaction-type.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, Transaction, TransactionType])],
  providers: [WalletService],
  exports: [WalletService],
})
export class FinancialAccountingModule {}
