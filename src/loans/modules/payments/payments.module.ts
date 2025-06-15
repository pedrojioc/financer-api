import { Module } from '@nestjs/common'
import { PaymentsService } from './payments.service'
import { LoansManagementModule } from '../loans-management/loans-management.module'
import { InterestsModule } from '../interests/interests.module'
import { InstallmentsModule } from '../installments/installments.module'
import { PaymentsController } from './payments.controller'
import { EmployeesModule } from 'src/employees/employees.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Payment } from 'src/loans/entities/payments.entity'
import { FinancialAccountingModule } from 'src/financial-accounting/financial-accounting.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    LoansManagementModule,
    InterestsModule,
    InstallmentsModule,
    EmployeesModule,
    FinancialAccountingModule,
  ],
  providers: [PaymentsService],
  exports: [PaymentsService],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
