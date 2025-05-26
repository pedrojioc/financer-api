import { IsArray, IsDate, IsNotEmpty, IsNumber, IsOptional, IsPositive } from 'class-validator'

export class CreatePaymentDto {
  @IsPositive()
  @IsNotEmpty()
  readonly loanId: number

  @IsPositive()
  @IsNotEmpty()
  readonly paymentMethodId: number

  @IsPositive()
  @IsNotEmpty()
  readonly paymentTypeId: number

  @IsNumber()
  readonly capital: number

  @IsNumber()
  readonly interest: number

  @IsNumber()
  readonly total: number

  @IsArray()
  @IsOptional()
  installmentIds?: number[]

  @IsDate()
  @IsNotEmpty()
  readonly date: Date
}
