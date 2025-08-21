import { Type } from 'class-transformer'
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsPositive,
  ValidateNested,
  ArrayMinSize,
  Min,
} from 'class-validator'

export class InstallmentPaymentDto {
  @IsPositive()
  id: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  interest?: number

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  capital?: number
}

export class ProcessPaymentV2Dto {
  @IsPositive()
  loanId: number

  @IsPositive()
  paymentMethodId: number

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => InstallmentPaymentDto)
  installmentPayments: InstallmentPaymentDto[]

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  totalAmount?: number

  @IsDateString({ strict: false })
  paymentDate: Date
}
