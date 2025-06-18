import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Wallet } from './entities/wallet.entity'
import { Transaction } from './entities/transaction.entity'
import { TransactionType } from './entities/transaction-type.entity'
import { WalletService } from './services/wallet.service'
import { WalletsController } from './controllers/wallets.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, Transaction, TransactionType])],
  providers: [WalletService],
  exports: [WalletService],
  controllers: [WalletsController],
})
export class WalletsModule {}
