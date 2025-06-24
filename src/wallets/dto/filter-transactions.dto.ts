import { OmitType } from '@nestjs/mapped-types'
import { FilterPaginatorDto } from 'src/lib/filter-paginator/dtos/filter-paginator.dto'

export class FilterTransactionsDto extends OmitType(FilterPaginatorDto, [
  'state',
  'searchBy',
  'searchValue',
]) {}
