import { Module } from '@nestjs/common'
import { ManualTasksService } from './services/manual-tasks.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Payment } from 'src/loans/modules/payments/entities/payments.entity'
import { InstallmentsModule } from 'src/loans/modules/installments/installments.module'
import { Commission } from 'src/employees/entities/commission.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Commission]), InstallmentsModule],
  providers: [ManualTasksService],
})
export class TasksModule {}
