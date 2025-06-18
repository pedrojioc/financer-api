import { Controller, Post, Body, Get, Param } from '@nestjs/common'
import { WalletService } from '../services/wallet.service'
import { CreateWalletDto } from '../dto/wallet.dto'

@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  create(@Body() createWalletDto: CreateWalletDto) {
    return this.walletService.createWallet(createWalletDto)
  }

  @Get()
  findAll() {
    return this.walletService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.walletService.findOne(id, ['transactions'])
  }
}
