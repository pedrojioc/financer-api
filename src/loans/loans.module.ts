import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { LoansController } from './controllers/loans.controller'
import { LoansService } from './services/loans.service'
import { Loan } from './entities/loan.entity'
import { CustomersModule } from 'src/customers/customers.module'
import { EmployeesModule } from 'src/employees/employees.module'
import { PaymentPeriod } from './entities/payment-period.entity'
import { LoanState } from './entities/loan-state.entity'
import { PaymentPeriodsService } from './services/payment-periods.service'
import { PaymentPeriodsController } from './controllers/payment-periods.controller'
import { LoanStatesService } from './services/loan-states.service'
import { LoanStatesController } from './controllers/loan-states.controller'
import { Interest } from './entities/interest.entity'
import { InterestState } from './entities/interest-state.entity'

import { Installment } from './entities/installment.entity'
import { PaymentMethod } from '../payment-methods/entities/payment-method.entity'
import { InstallmentState } from './entities/installment-state.entity'
import { InstallmentRepository } from './repositories/installment.repository'
import { InterestRepository } from './repositories/interest.repository'
import { JobInterestsService } from './services/jobs/job-interests.service'
import { InterestsModule } from './modules/interests/interests.module'
import { PaymentsModule } from './modules/payments/payments.module'
// import { LoanManagementService } from './services/loan-management.service'
import { InstallmentsModule } from './modules/installments/installments.module'
import { InstallmentsService } from './modules/installments/installments.service'
import { LoansManagementModule } from './modules/loans-management/loans-management.module'
import { LoanReportsModule } from './modules/loan-reports/loan-reports.module'
import { DailyInterestModule } from './modules/daily-interest/daily-interest.module'
import { InstallmentType } from './modules/installments/entities/installment-type.entity'
import { RefinancingModule } from './modules/refinancing/refinancing.module'
import { PaymentType } from './entities/payment-type.entity'
import { DeletedInstallment } from './entities/deleted-installment.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Loan,
      PaymentPeriod,
      LoanState,
      Interest,
      InterestState,
      Installment,
      InstallmentState,
      PaymentMethod,
      InstallmentType,
      PaymentType,
      DeletedInstallment,
    ]),
    CustomersModule,
    EmployeesModule,
    InterestsModule,
    PaymentsModule,
    InstallmentsModule,
    LoansManagementModule,
    LoanReportsModule,
    DailyInterestModule,
    RefinancingModule,
  ],
  controllers: [LoansController, PaymentPeriodsController, LoanStatesController],
  providers: [
    LoansService,
    PaymentPeriodsService,
    LoanStatesService,
    InstallmentsService,
    InstallmentRepository,
    InterestRepository,
    JobInterestsService,
  ],
})
export class LoansModule {}
