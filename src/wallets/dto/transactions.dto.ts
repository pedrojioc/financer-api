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

export class CreateTransactionDto {
  @IsPositive()
  @IsNotEmpty()
  transactionTypeId: number

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
  date: Date
}

export class NewTransactionDto extends OmitType(CreateTransactionDto, [
  'previousBalance',
  'newBalance',
]) {}
