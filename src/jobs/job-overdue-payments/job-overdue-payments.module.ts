import { Module } from '@nestjs/common'
import * as dotenv from 'dotenv'

import { JobOverduePaymentsService } from './job-overdue-payments.service'
import { DatabaseModule } from 'src/database/database.module'
import { InstallmentsModule } from 'src/loans/modules/installments/installments.module'
import { LoansManagementModule } from 'src/loans/modules/loans-management/loans-management.module'

dotenv.config()

@Module({
  imports: [DatabaseModule, InstallmentsModule, LoansManagementModule],
  providers: [JobOverduePaymentsService],
})
export class JobOverduePaymentsModule {}
