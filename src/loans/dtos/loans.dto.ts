import {
  IsNumber,
  IsNotEmpty,
  IsDateString,
  IsPositive,
  IsOptional,
  IsBoolean,
  IsDate,
} from 'class-validator'
import { PartialType } from '@nestjs/mapped-types'
import { Transform } from 'class-transformer'
import { parse } from '@formkit/tempo'

export class CreateLoanDto {
  @IsPositive()
  @IsNotEmpty()
  readonly customerId: number

  @IsPositive()
  @IsNotEmpty()
  readonly employeeId: number

  @IsPositive()
  @IsNotEmpty()
  readonly paymentPeriodId: number

  @IsPositive()
  @IsNotEmpty()
  readonly installmentTypeId: number

  @IsNumber()
  @IsNotEmpty()
  readonly amount: number

  @IsNumber()
  @IsNotEmpty()
  readonly interestRate: number

  @IsNumber()
  @IsOptional()
  debt?: number

  @IsNumber()
  @IsNotEmpty()
  readonly installmentsNumber: number

  @IsNumber()
  commissionRate: number

  @IsDate()
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'string') return parse(value, 'YYYY-MM-DD')

    return value
  })
  readonly startAt: Date

  @IsDate()
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'string') return parse(value, 'YYYY-MM-DD')

    return value
  })
  readonly endAt: Date

  @IsPositive()
  @IsOptional()
  paymentDay?: number

  @IsPositive()
  @IsNotEmpty()
  loanStateId: number

  @IsPositive()
  @IsOptional()
  parentLoanId?: number

  @IsBoolean()
  @IsOptional()
  readonly needsProrate?: boolean
}

export class UpdateLoanDto extends PartialType(CreateLoanDto) {
  @IsNumber()
  @IsOptional()
  installmentsPaid?: number

  @IsNumber()
  @IsOptional()
  readonly daysLate?: number

  @IsNumber()
  @IsOptional()
  readonly currentInterest?: number

  @IsNumber()
  @IsOptional()
  readonly totalInterestPaid?: number

  @IsNumber()
  @IsOptional()
  commissionsPaid?: number

  @IsDateString()
  @IsOptional()
  readonly lastInterestPayment?: Date

  @IsDateString({ strict: false })
  @IsOptional()
  lastNotificationSent?: Date

  @IsPositive()
  @IsOptional()
  currentInstallmentNumber?: number
}
