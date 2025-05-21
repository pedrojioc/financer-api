import { Injectable } from '@nestjs/common'
import { EntityManager } from 'typeorm'
import { CreateCommissionDto } from '../dtos/create-commission.dto'
import { Commission } from '../entities/commission.entity'
import { Installment } from 'src/loans/entities/installment.entity'
import { Loan } from 'src/loans/entities/loan.entity'
import { CreateCommissionDetailsDto } from '../dtos/create-commision-details.dto'
import { CommissionInstallment } from '../entities/commission-installment.entity'

@Injectable()
export class CommissionsService {
  constructor() {}

  async transactionalCreate(
    manager: EntityManager,
    createCommissionDto: CreateCommissionDto,
    commissionDetails: CreateCommissionDetailsDto[],
  ) {
    // TODO: Agregar la comisión al asesor

    const rs = await manager.insert(Commission, createCommissionDto)
    const commissionId = rs.raw.insertId

    const detailsValues = commissionDetails.map((detail) => ({
      ...detail,
      commissionId,
    }))

    await manager
      .createQueryBuilder()
      .insert()
      .into(CommissionInstallment)
      .values(detailsValues)
      .execute()

    return createCommissionDto.amount
  }

  /**
  createCommissionData(
    commissionRate: number,
    employeeId: number,
    installmentId: number,
    interestPaid: number,
  ): CreateCommissionDto {
    const commissionAmount = (interestPaid * commissionRate) / 100
    return {
      employeeId,
      installmentId,
      interestAmount: interestPaid,
      amount: commissionAmount,
      rate: commissionRate,
      isPaid: false,
    }
  }
  */
}
