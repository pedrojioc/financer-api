import { Module } from '@nestjs/common'
import { InstallmentsService } from './installments.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Installment } from 'src/loans/modules/installments/entities/installment.entity'
import { InstallmentFactoryService } from './installment-factory.service'
import { InstallmentsController } from './installments.controller'
import { InstallmentTypesController } from './installment-types.controller'
import { InstallmentTypesService } from './installment-types.service'
import { InstallmentType } from './entities/installment-type.entity'
import { DeletedInstallment } from 'src/loans/modules/installments/entities/deleted-installment.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Installment, InstallmentType, DeletedInstallment])],
  providers: [InstallmentsService, InstallmentFactoryService, InstallmentTypesService],
  exports: [InstallmentsService, InstallmentFactoryService],
  controllers: [InstallmentsController, InstallmentTypesController],
})
export class InstallmentsModule {}
