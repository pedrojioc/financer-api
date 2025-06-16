import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { LoansController } from './controllers/loans.controller'
import { LoansService } from './services/loans.service'
import { Loan } from './entities/loan.entity'

import { PaymentPeriod } from './modules/payments/entities/payment-period.entity'
import { LoanState } from './entities/loan-state.entity'
import { PaymentPeriodsService } from './services/payment-periods.service'
import { PaymentPeriodsController } from './controllers/payment-periods.controller'
import { LoanStatesService } from './services/loan-states.service'
import { LoanStatesController } from './controllers/loan-states.controller'

import { LoansManagementModule } from './modules/loans-management/loans-management.module'
import { RefinancingModule } from './modules/refinancing/refinancing.module'
import { PdfModule } from 'src/pdf/pdf.module'
import { FinancialAccountingModule } from 'src/financial-accounting/financial-accounting.module'
import { InstallmentsModule } from 'src/loans/modules/installments/installments.module'
import { PaymentsModule } from './modules/payments/payments.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Loan, PaymentPeriod, LoanState]),

    LoansManagementModule,
    RefinancingModule,
    InstallmentsModule,
    FinancialAccountingModule,
    PaymentsModule,
    PdfModule,
  ],
  controllers: [LoansController, PaymentPeriodsController, LoanStatesController],
  providers: [LoansService, PaymentPeriodsService, LoanStatesService],
})
export class LoansModule {}
