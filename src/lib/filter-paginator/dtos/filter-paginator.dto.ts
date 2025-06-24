import { Type } from 'class-transformer'
import { IsOptional, IsPositive, IsString } from 'class-validator'

export class FilterPaginatorDto {
  @IsPositive()
  @Type(() => Number)
  @IsOptional()
  state?: number

  @IsOptional()
  @IsString()
  searchBy?: string

  @IsOptional()
  @IsString()
  searchValue?: string

  @IsPositive()
  @Type(() => Number)
  @IsOptional()
  page?: number = 1

  @IsPositive()
  @Type(() => Number)
  @IsOptional()
  itemsPerPage?: number = 10
}
