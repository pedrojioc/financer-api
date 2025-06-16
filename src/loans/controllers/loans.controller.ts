import { Body, Controller, Get, Header, Param, Post, Query, Req, Res } from '@nestjs/common'
import { Request, Response } from 'express'

import { CreateLoanDto } from 'src/loans/dtos/loans.dto'
import { LoansService } from 'src/loans/services/loans.service'
import { FilterLoansDto } from 'src/loans/dtos/filter-loans.dto'
import { AuthJwtPayload } from 'src/auth/types/token.model'

@Controller('loans')
export class LoansController {
  constructor(private loansService: LoansService) {}

  @Post()
  create(@Body() payload: CreateLoanDto) {
    return this.loansService.create(payload)
  }

  @Get()
  findAll(@Req() req: Request, @Query() params: FilterLoansDto) {
    const user = req.user as AuthJwtPayload
    return this.loansService.findAll(params, user.role, user.sub)
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.loansService.findOne(id, ['customer', 'employee', 'loanState'])
  }

  @Get('contracts/:id')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename=contrato.pdf')
  async downloadContract(@Param('id') id: number, @Res() res: Response) {
    const pdf = await this.loansService.generateContract(id)
    res.send(pdf)
  }
}
