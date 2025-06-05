import {
  IsDateString,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator'

export class CreateCustomerDto {
  @IsPositive()
  @IsNotEmpty()
  genderId: number

  @IsPositive()
  @IsNotEmpty()
  financialActivityId: number

  @IsString()
  @IsNotEmpty()
  name: string

  @IsNotEmpty()
  @IsNumberString()
  idNumber: string

  @IsString()
  @IsNotEmpty()
  address: string

  @IsNumberString()
  phoneNumber: string

  @IsDateString({ strict: false, strictSeparator: false })
  @IsOptional()
  birthdate?: Date

  @IsString()
  @IsOptional()
  personalReference?: string

  @IsNumberString()
  @IsOptional()
  personalReferencePhone?: string

  @IsString()
  @IsOptional()
  workReference?: string

  @IsNumberString()
  @IsOptional()
  workReferencePhone?: string
}
