import { Controller, Get, Param } from '@nestjs/common'
import { TransactionTypesService } from '../services/transaction-types.service'

@Controller('transaction-types')
export class TransactionTypesController {
  constructor(private readonly transactionTypesService: TransactionTypesService) {}

  @Get()
  findAll() {
    return this.transactionTypesService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.transactionTypesService.findOne(id)
  }
}
