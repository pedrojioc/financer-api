import { Module } from '@nestjs/common'
import { LoanSnapshotsService } from './services/loan-snapshots.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LoanBalanceSnapshot } from './entities/loan-balance-snapshot.entity'

@Module({
	imports: [TypeOrmModule.forFeature([LoanBalanceSnapshot])],
	exports: [LoanSnapshotsService],
	providers: [LoanSnapshotsService],
})
export class LoanHistoryModule {}
