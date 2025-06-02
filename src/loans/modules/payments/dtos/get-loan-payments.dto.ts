import { OmitType } from '@nestjs/mapped-types'
import { Type } from 'class-transformer'
import { IsPositive } from 'class-validator'
import { FilterPaginatorDto } from 'src/lib/filter-paginator/dtos/filter-paginator.dto'

export class GetLoanPaymentsDto extends OmitType(FilterPaginatorDto, [
  'searchBy',
  'searchValue',
] as const) {
  @IsPositive()
  @Type(() => Number)
  loanId: number
}
