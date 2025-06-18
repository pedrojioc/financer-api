import { Module } from '@nestjs/common'
import { PaymentsService } from './payments.service'
import { LoansManagementModule } from '../loans-management/loans-management.module'
import { InstallmentsModule } from '../installments/installments.module'
import { PaymentsController } from './payments.controller'
import { EmployeesModule } from 'src/employees/employees.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { WalletsModule } from 'src/wallets/wallets.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([]),
    LoansManagementModule,
    InstallmentsModule,
    EmployeesModule,
    WalletsModule,
  ],
  providers: [PaymentsService],
  exports: [PaymentsService],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
