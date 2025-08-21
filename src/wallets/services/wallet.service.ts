import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { Wallet } from '../entities/wallet.entity'
import { CreateWalletDto, WalletMovementDto } from '../dto/wallet.dto'
import { TransactionsService } from './transactions.service'
import { NewTransactionDto } from '../dto/transactions.dto'
import { FlowType } from '../dto/transactions.dto'

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    private readonly transactionService: TransactionsService,
  ) {}

  createWallet(wallet: CreateWalletDto): Promise<Wallet> {
    return this.walletRepository.save(wallet)
  }

  async debit(newTransaction: WalletMovementDto, manager: EntityManager) {
    const wallet = await manager.findOne(Wallet, { where: { id: newTransaction.walletId } })
    const amount = -newTransaction.amount

    const previousBalance = Number(wallet.balance)
    const newBalance = wallet.balance + amount
    wallet.balance = newBalance

    await manager.save(wallet)

    const transaction = {
      ...newTransaction,
      amount,
      previousBalance,
      newBalance,
      flowType: FlowType.OUTFLOW,
    }
    await this.transactionService.create(transaction, manager)

    return wallet
  }

  async deposit(newTransaction: WalletMovementDto, manager: EntityManager) {
    const wallet = await manager.findOne(Wallet, { where: { id: newTransaction.walletId } })
    const amount = newTransaction.amount

    const previousBalance = Number(wallet.balance)
    const newBalance = wallet.balance + amount
    wallet.balance = newBalance

    await manager.save(wallet)

    const transaction = {
      ...newTransaction,
      amount,
      previousBalance,
      newBalance,
      flowType: FlowType.INFLOW,
    }
    await this.transactionService.create(transaction, manager)

    return wallet
  }

  async findAll() {
    const wallets = await this.walletRepository.find()
    const result = wallets.map(async (wallet) => {
      const txnFrom = await this.transactionService.findTransactionsFromDaysAgo(wallet.id, 1, true)
      const variation = this.porcentualVariation(txnFrom?.newBalance || 0, wallet.balance)
      return {
        ...wallet,
        variation,
      }
    })
    return Promise.all(result)
  }

  findOne(id: number, relations?: string[]) {
    return this.walletRepository.findOne({ where: { id }, relations })
  }

  porcentualVariation(oldBalance: number, newBalance: number) {
    if (oldBalance === 0) {
      return 0
    }
    return ((newBalance - oldBalance) / Math.abs(oldBalance)) * 100
  }
}
