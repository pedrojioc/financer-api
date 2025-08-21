import { Body, Controller, Get, Patch, Post, Query, Req } from '@nestjs/common'
import { PaymentsService } from './payments.service'
import { NewPaymentDto } from './dtos/new-payment.dto'
import { ProcessPaymentV2Dto } from './dtos/process-payment-v2.dto'
import { NewCapitalPaymentDto } from './dtos/new-capital-payment.dto'
import { FilterPaymentsDto } from './dtos/filter-payments.dto'
import { MarkPaymentAsReceived } from './dtos/bulk-received.dto'
import { GetLoanPaymentsDto } from './dtos/get-loan-payments.dto'

@Controller('payments')
export class PaymentsController {
  constructor(private paymentService: PaymentsService) {}

  @Get()
  findAll(@Query() params: FilterPaymentsDto) {
    return this.paymentService.findAll(params)
  }

  @Get('loans/:id')
  findAllByLoan(@Query() params: GetLoanPaymentsDto) {
    return this.paymentService.findAllByLoan(params)
  }

  @Post()
  create(@Body() data: NewPaymentDto) {
    return this.paymentService.newPayment(data)
  }

  @Post('v2')
  createV2(@Body() data: ProcessPaymentV2Dto) {
    return this.paymentService.newPaymentV2(data)
  }

  @Post('capital')
  capital(@Body() data: NewCapitalPaymentDto) {
    return this.paymentService.capitalPayment(data)
  }

  @Patch('received')
  checked(@Body() data: MarkPaymentAsReceived) {
    return this.paymentService.markAsReceived(data)
  }

  @Get('/summary')
  summary(@Query() params: FilterPaymentsDto) {
    return this.paymentService.summary(params)
  }
}
