import { PartialType } from '@nestjs/mapped-types'
import { IsOptional, IsPositive } from 'class-validator'
import { NewPaymentDto } from '../modules/payments/dtos/new-payment.dto'

export class PayOffDto extends PartialType(NewPaymentDto) {
  instalmentId?: number
}
