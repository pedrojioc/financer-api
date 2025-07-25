import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsDate,
  IsPositive,
  IsOptional,
  IsEnum,
} from 'class-validator'
import { OmitType } from '@nestjs/mapped-types'
import { Transform } from 'class-transformer'
import { parse } from '@formkit/tempo'

export class CreateTransactionDto {
  @IsPositive()
  @IsNotEmpty()
  transactionTypeId: number

  @IsPositive()
  @IsNotEmpty()
  transactionCategoryId: number

  @IsPositive()
  @IsNotEmpty()
  walletId: number

  @IsEnum(['INFLOW', 'OUTFLOW'])
  @IsNotEmpty()
  flowType: 'INFLOW' | 'OUTFLOW'

  @IsPositive()
  @IsOptional()
  loanId?: number

  @IsString()
  @IsNotEmpty()
  description: string

  @IsNumber()
  @IsNotEmpty()
  amount: number

  @IsNumber()
  previousBalance: number

  @IsNumber()
  newBalance: number

  @IsDate()
  @IsNotEmpty()
  @Transform(({ value }) => {
    if (typeof value === 'string') return parse(value, 'YYYY-MM-DD')

    return value
  })
  date: Date
}

export class NewTransactionDto extends OmitType(CreateTransactionDto, [
  'previousBalance',
  'newBalance',
]) {}
