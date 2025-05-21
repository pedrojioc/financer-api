import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { EmployeesController } from './controllers/employees.controller'
import { Employee } from './entities/employee.entity'
import { Position } from './entities/position.entity'
import { PositionsService } from './services/positions.service'
import { EmployeesService } from './services/employees.service'
import { PositionsController } from './controllers/positions.controller'
import { EmployeeBalance } from './entities/employee-balance.entity'
import { Commission } from './entities/commission.entity'
import { CommissionsService } from './services/commissions.service'
import { CommissionInstallment } from './entities/commission-installment.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Employee,
      Position,
      EmployeeBalance,
      Commission,
      CommissionInstallment,
    ]),
  ],
  controllers: [EmployeesController, PositionsController],
  providers: [PositionsService, EmployeesService, CommissionsService],
  exports: [EmployeesService, CommissionsService],
})
export class EmployeesModule {}
