import { Module } from '@nestjs/common'
import { JobInstallmentsService } from './job-installments.service'
import * as dotenv from 'dotenv'

import { InstallmentsModule } from 'src/loans/modules/installments/installments.module'
import { LoansManagementModule } from 'src/loans/modules/loans-management/loans-management.module'
import { DatabaseModule } from 'src/database/database.module'

// Load environment variables directly
dotenv.config()

// Set entity paths based on environment
let entitiesPath = 'src/**/*.entity.ts'
if (process.env.NODE_ENV === 'production') {
  entitiesPath = 'dist/src/**/*.entity.js'
}

@Module({
  imports: [DatabaseModule, InstallmentsModule, LoansManagementModule],
  providers: [JobInstallmentsService],
  exports: [JobInstallmentsService],
})
export class JobInstallmentsModule {}
