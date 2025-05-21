import { IsBoolean, IsNotEmpty, IsPositive } from 'class-validator'

export class CreateCommissionDto {
  @IsPositive()
  @IsNotEmpty()
  readonly employeeId: number

  @IsPositive()
  @IsNotEmpty()
  readonly paymentId: number

  @IsPositive()
  interestAmount: number

  @IsPositive()
  readonly amount: number

  @IsPositive() // ? Tasa de comisión
  readonly rate: number

  @IsBoolean()
  readonly isPaid: boolean
}
