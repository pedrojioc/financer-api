import { IsDate, IsInt, IsNumber, IsPositive } from 'class-validator'
import { Type } from 'class-transformer'

export class CreateLoanSnapshotDto {
	@IsInt()
	@IsPositive()
	loanId: number

	@IsNumber()
	@Type(() => Number)
	debt: number

	@IsNumber()
	@Type(() => Number)
	overdueInterest: number

	@IsNumber()
	@Type(() => Number)
	interestRate: number

	@IsDate()
	@Type(() => Date)
	snapshotDate: Date
}
