import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { LoansController } from './controllers/loans.controller'
import { LoansService } from './services/loans.service'
import { Loan } from './entities/loan.entity'
import { LoanState } from './entities/loan-state.entity'
import { LoanStatesService } from './services/loan-states.service'
import { LoanStatesController } from './controllers/loan-states.controller'

import { LoansManagementModule } from './modules/loans-management/loans-management.module'
import { RefinancingModule } from './modules/refinancing/refinancing.module'
import { PdfModule } from 'src/pdf/pdf.module'
import { InstallmentsModule } from 'src/loans/modules/installments/installments.module'
import { PaymentsModule } from './modules/payments/payments.module'
import { WalletsModule } from 'src/wallets/wallets.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Loan, LoanState]),
    LoansManagementModule,
    RefinancingModule,
    InstallmentsModule,
    WalletsModule,
    PaymentsModule,
    PdfModule,
  ],
  controllers: [LoansController, LoanStatesController],
  providers: [LoansService, LoanStatesService],
})
export class LoansModule {}
