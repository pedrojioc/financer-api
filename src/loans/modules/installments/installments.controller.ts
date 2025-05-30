import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common'
import { Request } from 'express'

import { UpdateInstallmentDto } from 'src/loans/dtos/update-installment.dto'
import { InstallmentsService } from './installments.service'
import { DailyInterestService } from '../daily-interest/daily-interest.service'
import { FilterPaginatorDto } from 'src/lib/filter-paginator/dtos/filter-paginator.dto'
import { CreateInstallmentDto } from 'src/loans/dtos/create-installment.dto'
import { AuthJwtPayload } from 'src/auth/types/token.model'

@Controller('installments')
export class InstallmentsController {
  constructor(
    private readonly installmentService: InstallmentsService,
    private readonly dailyInterestService: DailyInterestService,
  ) {}

  @Post()
  create(@Body() data: CreateInstallmentDto) {
    return this.installmentService.create(data)
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() data: UpdateInstallmentDto) {
    return this.installmentService.update(id, data)
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: number) {
    const payload = req.user as AuthJwtPayload
    return this.installmentService.delete(id, payload.sub)
  }

  @Get(':id/daily-interest')
  dailyInterest(@Param('id') id: number, @Query() params: FilterPaginatorDto) {
    return this.dailyInterestService.findAllByInstallment(id, params)
  }

  @Get('/states')
  getStates() {
    return this.installmentService.getStates()
  }
}
