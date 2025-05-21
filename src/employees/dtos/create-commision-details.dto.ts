import { IsBoolean, IsNotEmpty, IsPositive } from 'class-validator'

export class CreateCommissionDetailsDto {
  @IsPositive()
  @IsNotEmpty()
  readonly commissionId: number

  @IsPositive()
  @IsNotEmpty()
  readonly installmentId: number

  @IsPositive()
  amount: number
}
