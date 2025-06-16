import { Module } from '@nestjs/common'
import { PaymentsService } from './payments.service'
import { LoansManagementModule } from '../loans-management/loans-management.module'
import { InstallmentsModule } from '../installments/installments.module'
import { PaymentsController } from './payments.controller'
import { EmployeesModule } from 'src/employees/employees.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { FinancialAccountingModule } from 'src/financial-accounting/financial-accounting.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([]),
    LoansManagementModule,
    InstallmentsModule,
    EmployeesModule,
    FinancialAccountingModule,
  ],
  providers: [PaymentsService],
  exports: [PaymentsService],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
