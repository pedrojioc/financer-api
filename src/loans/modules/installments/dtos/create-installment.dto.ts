import { parse } from '@formkit/tempo'
import { Transform, Type } from 'class-transformer'
import { IsDate, IsNumber, IsOptional, IsPositive } from 'class-validator'

export class CreateInstallmentDto {
  @IsPositive()
  loanId: number

  @IsPositive()
  @IsOptional()
  installmentStateId: number

  @IsNumber()
  @Type(() => Number)
  debt: number

  @IsDate()
  @Transform(({ value }) => {
    if (typeof value === 'string') return parse(value, 'YYYY-MM-DD')

    return value
  })
  startsOn: Date

  @IsDate()
  @Transform(({ value }) => {
    if (typeof value === 'string') return parse(value, 'YYYY-MM-DD')

    return value
  })
  paymentDeadline: Date

  @IsNumber()
  days: number

  @IsNumber()
  @Type(() => Number)
  capital: number

  @IsNumber()
  @Type(() => Number)
  interest: number

  @IsNumber()
  @Type(() => Number)
  interestPaid: number

  @IsNumber()
  @Type(() => Number)
  total: number
}
