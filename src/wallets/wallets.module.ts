import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Wallet } from './entities/wallet.entity'
import { Transaction } from './entities/transaction.entity'
import { TransactionType } from './entities/transaction-type.entity'
import { WalletService } from './services/wallet.service'
import { WalletsController } from './controllers/wallets.controller'
import { TransactionsService } from './services/transactions.service'
import { TransactionTypesController } from './controllers/transaction-types.controller'
import { TransactionTypesService } from './services/transaction-types.service'

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, Transaction, TransactionType])],
  providers: [WalletService, TransactionsService, TransactionTypesService],
  exports: [WalletService, TransactionsService],
  controllers: [WalletsController, TransactionTypesController],
})
export class WalletsModule {}
