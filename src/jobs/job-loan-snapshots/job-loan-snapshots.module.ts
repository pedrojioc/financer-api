import { Module } from '@nestjs/common'
import * as dotenv from 'dotenv'

import { JobLoanSnapshotsService } from './job-loan-snapshots.service'
import { DatabaseModule } from 'src/database/database.module'
import { InstallmentsModule } from 'src/loans/modules/installments/installments.module'
import { LoansManagementModule } from 'src/loans/modules/loans-management/loans-management.module'
import { LoanHistoryModule } from 'src/loans/modules/loan-history/loan-history.module'

dotenv.config()

@Module({
	imports: [DatabaseModule, InstallmentsModule, LoansManagementModule, LoanHistoryModule],
	providers: [JobLoanSnapshotsService],
})
export class JobLoanSnapshotsModule {}
