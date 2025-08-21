import { OmitType } from '@nestjs/mapped-types'
import { IsString, IsNumber, IsOptional, IsNotEmpty, IsPositive } from 'class-validator'
import { NewTransactionDto } from './transactions.dto'

export class CreateWalletDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsNumber()
  @IsNotEmpty()
  balance: number

  @IsString()
  @IsOptional()
  description?: string
}

export class UpdateWalletDto {
  @IsPositive()
  @IsNotEmpty()
  readonly id: number

  @IsString()
  @IsOptional()
  name?: string

  @IsNumber()
  @IsOptional()
  balance?: number

  @IsString()
  @IsOptional()
  description?: string
}

export class WalletMovementDto extends OmitType(NewTransactionDto, ['flowType']) {}
