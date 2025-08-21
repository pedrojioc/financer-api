import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsWhere, Repository } from 'typeorm'
import { EntityManager } from 'typeorm'

import { Transaction } from '../entities/transaction.entity'
import { Wallet } from '../entities/wallet.entity'
import { FilterPaginator } from 'src/lib/filter-paginator'
import { NewTransactionDto, FlowType } from '../dto/transactions.dto'
import { CreateTransactionDto } from '../dto/transactions.dto'
import { FilterTransactionsDto } from '../dto/filter-transactions.dto'

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>,
    private readonly entityManager: EntityManager,
  ) {}

  /**
   * Realiza una transacción en una cartera
   * @param newtransactionDto
   * @param manager
   * @returns Promise<Wallet>
   */
  async create(transactionDto: CreateTransactionDto, manager?: EntityManager) {
    const query = manager || this.entityManager
    await query.insert(Transaction, transactionDto)
  }

  findAllByWallet(walletId: number, params: FilterTransactionsDto) {
    const whereOptions: FindOptionsWhere<Transaction> = {
      walletId,
    }

    const paginator = new FilterPaginator(this.transactionRepo, {
      where: whereOptions,
      itemsPerPage: params.itemsPerPage,
    })
    const result = paginator.paginate(params.page).execute()
    return result
  }

  async findTransactionsFromDaysAgo(walletId: number, days: number, lastIfEmpty: boolean = false) {
    let transaction = await this.transactionRepo
      .createQueryBuilder('transaction')
      .where('transaction.wallet_id = :walletId', { walletId })
      .andWhere('transaction.date >= CURRENT_DATE - INTERVAL :days DAY', { days })
      .orderBy('transaction.date', 'ASC')
      .getOne()

    if (!transaction && lastIfEmpty) {
      transaction = await this.transactionRepo
        .createQueryBuilder('transaction')
        .where('transaction.wallet_id = :walletId', { walletId })
        .orderBy('transaction.date', 'ASC')
        .getOne()
    }

    return transaction
  }

  async getBalanceHistoryOfWallet(walletId: number, take: number = 10) {
    const transactions = await this.transactionRepo.find({
      where: { walletId },
      order: { createdAt: 'DESC' },
      take,
    })

    const balanceHistory = transactions.map((transaction, index) => {
      return {
        date: transaction.createdAt,
        value: transaction.newBalance,
      }
    })
    return balanceHistory
  }

  async transaction(newTransactionDto: NewTransactionDto, manager?: EntityManager): Promise<Wallet> {
    const query = manager || this.entityManager
    
    const wallet = await query.findOne(Wallet, { where: { id: newTransactionDto.walletId } })
    if (!wallet) {
      throw new Error(`Wallet with id ${newTransactionDto.walletId} not found`)
    }

    const previousBalance = Number(wallet.balance)
    let amount = newTransactionDto.amount
    let newBalance: number

    if (newTransactionDto.flowType === FlowType.OUTFLOW) {
      amount = -amount
      newBalance = previousBalance + amount
    } else {
      newBalance = previousBalance + amount
    }

    wallet.balance = newBalance
    await query.save(wallet)

    const transactionData: CreateTransactionDto = {
      ...newTransactionDto,
      amount,
      previousBalance,
      newBalance,
    }

    await query.insert(Transaction, transactionData)
    return wallet
  }
}
