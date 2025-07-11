import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common'
import { Request } from 'express'

import { UpdateInstallmentDto } from 'src/loans/modules/installments/dtos/update-installment.dto'
import { InstallmentsService } from './installments.service'
import { FilterInstallmentsDto } from './dtos/filter-installments.dto'
import { CreateInstallmentDto } from 'src/loans/modules/installments/dtos/create-installment.dto'
import { AuthJwtPayload } from 'src/auth/types/token.model'

@Controller('installments')
export class InstallmentsController {
	constructor(private readonly installmentService: InstallmentsService) {}

	@Post()
	create(@Body() data: CreateInstallmentDto) {
		return this.installmentService.create(data)
	}

	@Get()
	findAll(@Query() params: FilterInstallmentsDto) {
		return this.installmentService.findAllByLoan(params)
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

	@Get('/states')
	getStates() {
		return this.installmentService.getStates()
	}

	@Get('/month')
	getInstallmentsOfTheMonth(@Query() date: string) {
		return this.installmentService.getInstallmentsByMonth(date)
	}
}
