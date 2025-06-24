import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'

import { Wallet } from '../entities/wallet.entity'
import { Transaction } from '../entities/transaction.entity'
import { CreateWalletDto, UpdateWalletDto } from '../dto/wallet.dto'
import { CreateTransactionDto, NewTransactionDto } from '../dto/transactions.dto'

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(Transaction) private readonly transactionRepo: Repository<Transaction>,
  ) {}

  createWallet(wallet: CreateWalletDto): Promise<Wallet> {
    return this.walletRepository.save(wallet)
  }

  findAll() {
    return this.walletRepository.find()
  }

  findOne(id: number, relations?: string[]) {
    return this.walletRepository.findOne({ where: { id }, relations })
  }

  async getBalanceHistory(walletId: number, take: number = 10) {
    const transactions = await this.transactionRepo.find({
      where: { walletId },
      order: { createdAt: 'DESC' },
      take,
    })
    console.log(transactions)
    const balanceHistory = transactions.map((transaction, index) => {
      return {
        index: index + 1,
        value: transaction.newBalance,
      }
    })
    return balanceHistory
  }

  porcentualVariation(oldBalance: number, newBalance: number) {
    if (oldBalance === 0) {
      throw new Error('No se puede calcular variación porcentual sobre cero.')
    }
    return ((newBalance - oldBalance) / Math.abs(oldBalance)) * 100
  }
}
