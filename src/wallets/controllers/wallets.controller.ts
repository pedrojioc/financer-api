import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common'
import { WalletService } from '../services/wallet.service'
import { CreateWalletDto } from '../dto/wallet.dto'
import { TransactionsService } from '../services/transactions.service'
import { FilterTransactionsDto } from '../dto/filter-transactions.dto'
import { NewTransactionDto } from '../dto/transactions.dto'

@Controller('wallets')
export class WalletsController {
  constructor(
    private readonly walletService: WalletService,
    private readonly transactionService: TransactionsService,
  ) {}

  @Post()
  create(@Body() createWalletDto: CreateWalletDto) {
    return this.walletService.createWallet(createWalletDto)
  }

  @Get()
  findAll() {
    return this.walletService.findAll()
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    const wallet = await this.walletService.findOne(id)
    const balanceHistory = await this.walletService.getBalanceHistory(id)
    const transactionFrom7Days = await this.transactionService.findTransactionsFromDaysAgo(
      id,
      7,
      true,
    )
    const transactionFrom30Days = await this.transactionService.findTransactionsFromDaysAgo(
      id,
      30,
      true,
    )

    const variationLast7Days = this.walletService.porcentualVariation(
      transactionFrom7Days.newBalance,
      wallet.balance,
    )

    const variationLast30Days = this.walletService.porcentualVariation(
      transactionFrom30Days.newBalance,
      wallet.balance,
    )

    return {
      wallet,
      variationLast7Days,
      variationLast30Days,
      balanceHistory,
    }
  }

  @Get(':id/transactions')
  async transactions(@Param('id') id: number, @Query() params: FilterTransactionsDto) {
    return this.transactionService.findAllByWallet(id, params)
  }

  @Post(':id/transactions')
  async transaction(@Param('id') id: number, @Body() transactionDto: NewTransactionDto) {
    return this.transactionService.transaction(transactionDto)
  }
}
