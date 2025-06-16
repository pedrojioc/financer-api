import { Module } from '@nestjs/common'
import { LoanReportsService } from './loan-reports.service'
import { LoanReportsController } from './loan-reports.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Loan } from 'src/loans/entities/loan.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Loan])],
  providers: [LoanReportsService],
  controllers: [LoanReportsController],
})
export class LoanReportsModule {}
