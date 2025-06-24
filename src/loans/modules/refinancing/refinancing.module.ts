import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { RefinancingController } from './refinancing.controller'
import { RefinancingService } from './refinancing.service'
import { LoansManagementModule } from '../loans-management/loans-management.module'
import { InstallmentsModule } from '../installments/installments.module'
import { WalletsModule } from 'src/wallets/wallets.module'

@Module({
  imports: [TypeOrmModule.forFeature([]), LoansManagementModule, InstallmentsModule, WalletsModule],
  providers: [RefinancingService],
  controllers: [RefinancingController],
})
export class RefinancingModule {}
