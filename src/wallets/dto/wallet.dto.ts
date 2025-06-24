import { IsString, IsNumber, IsOptional, IsNotEmpty, IsPositive } from 'class-validator'

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
