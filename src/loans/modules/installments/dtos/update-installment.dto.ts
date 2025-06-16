import { PartialType } from '@nestjs/mapped-types'
import { CreateInstallmentDto } from './create-installment.dto'
import { IsDate, IsNumber, IsOptional, IsPositive } from 'class-validator'
import { Type } from 'class-transformer'

export class UpdateInstallmentDto extends PartialType(CreateInstallmentDto) {
  @IsPositive()
  @Type(() => Number)
  @IsOptional()
  customInterest?: number

  @IsNumber()
  @IsOptional()
  interestPaymentAmount?: number

  @IsDate()
  @IsOptional()
  paymentDate?: Date
}
