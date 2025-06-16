import { IsOptional, IsPositive } from 'class-validator'
import { FilterPaginatorDto } from 'src/lib/filter-paginator/dtos/filter-paginator.dto'
import { Type } from 'class-transformer'

export class FilterInstallmentsDto extends FilterPaginatorDto {
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  loanId?: number
}
