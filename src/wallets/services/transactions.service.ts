import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsWhere, Repository } from 'typeorm'
import { EntityManager } from 'typeorm'

import { Transaction } from '../entities/transaction.entity'
import { Wallet } from '../entities/wallet.entity'
import { FilterPaginator } from 'src/lib/filter-paginator'
import { NewTransactionDto } from '../dto/transactions.dto'
import { CreateTransactionDto } from '../dto/transactions.dto'
import { FilterTransactionsDto } from '../dto/filter-transactions.dto'

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
    private readonly entityManager: EntityManager,
  ) {}

  /**
   * Realiza una transacción en una cartera
   * @param newtransactionDto
   * @param manager
   * @returns Promise<Wallet>
   */
  async transaction(newtransactionDto: NewTransactionDto, manager?: EntityManager) {
    const query = manager || this.entityManager
    const wallet = await query.findOne(Wallet, { where: { id: newtransactionDto.walletId } })
    const amount =
      newtransactionDto.flowType === 'INFLOW' ? newtransactionDto.amount : -newtransactionDto.amount
    const previousBalance = Number(wallet.balance)
    const newBalance = previousBalance + amount
    const transactionDto: CreateTransactionDto = {
      ...newtransactionDto,
      amount,
      previousBalance,
      newBalance,
    }

    await query.insert(Transaction, transactionDto)
    return query.update(Wallet, wallet.id, { balance: newBalance })
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
}
