import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'

import { Wallet } from '../entities/wallet.entity'
import { Transaction } from '../entities/transactions.entity'
import { CreateWalletDto, UpdateWalletDto } from '../dto/wallet.dto'
import { CreateTransactionDto, NewTransactionDto } from '../dto/transactions.dto'

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
  ) {}

  createWallet(wallet: CreateWalletDto): Promise<Wallet> {
    return this.walletRepository.save(wallet)
  }

  /**
   * Realiza una transacción en una cartera
   * @param type
   * @param newtransactionDto
   * @param manager
   * @returns Promise<Wallet>
   */
  async transaction(
    type: 'inflow' | 'outflow',
    newtransactionDto: NewTransactionDto,
    manager: EntityManager,
  ) {
    const wallet = await manager.findOne(Wallet, { where: { id: newtransactionDto.walletId } })
    const amount = type === 'inflow' ? newtransactionDto.amount : -newtransactionDto.amount
    const previousBalance = Number(wallet.amount)
    const newBalance = previousBalance + amount
    const transactionDto: CreateTransactionDto = {
      ...newtransactionDto,
      previousBalance,
      newBalance,
    }

    await manager.insert(Transaction, transactionDto)
    return manager.update(Wallet, wallet.id, { amount: newBalance })
  }
}
