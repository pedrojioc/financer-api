import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Wallet } from './entities/wallet.entity'
import { Transaction } from './entities/transaction.entity'
import { TransactionCategory } from './entities/transaction-category.entity'
import { WalletService } from './services/wallet.service'
import { WalletsController } from './controllers/wallets.controller'
import { TransactionsService } from './services/transactions.service'
import { TransactionTypesController } from './controllers/transaction-types.controller'
import { TransactionTypesService } from './services/transaction-types.service'
import { TransactionType } from './entities/transaction-type.entity'
import { TransactionCategoriesController } from './controllers/transaction-categories.controller';
import { TransactionCategoriesService } from './services/transaction-categories.service';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, Transaction, TransactionCategory, TransactionType])],
  providers: [WalletService, TransactionsService, TransactionTypesService, TransactionCategoriesService],
  exports: [WalletService, TransactionsService],
  controllers: [WalletsController, TransactionTypesController, TransactionCategoriesController],
})
export class WalletsModule {}
