import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnprocessableEntityException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Refinancing } from './entities/refinancing.entity'
import { DataSource, EntityManager, Repository } from 'typeorm'
import { NewRefinancingDto } from './dtos/new-refinancing.dto'
import { CreateRefinancingDto } from './dtos/create-refinancing.dto'
import { LOAN_STATES } from 'src/loans/shared/constants'
import { Loan } from 'src/loans/entities/loan.entity'
import { LoanManagementService } from '../loans-management/loans-management.service'
import { InstallmentsService } from '../installments/installments.service'
import { INSTALLMENT_STATES } from 'src/loans/modules/installments/constants/installments.c'
import { Transactional } from 'src/shared/transactional/transactional.decorator'

@Injectable()
export class RefinancingService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly loanService: LoanManagementService,
    private readonly installmentService: InstallmentsService,
  ) {}

  generateRefinancingObject(
    originLoan: Loan,
    newLoan: Loan,
    newRefinancingDto: NewRefinancingDto,
  ): CreateRefinancingDto {
    const refinancingDto: CreateRefinancingDto = {
      originLoanId: originLoan.id,
      newLoanId: newLoan.id,
      previousAmount: originLoan.amount,
      newAmount: newLoan.amount,
      refinancingDate: newRefinancingDto.refinancingDate,
      note: newRefinancingDto.note,
    }

    return refinancingDto
  }

  @Transactional()
  async create(newRefinancingDto: NewRefinancingDto, manager?: EntityManager) {
    if (!manager) throw new InternalServerErrorException('Transaction manager is required')

    if (!newRefinancingDto.originLoanId) throw new BadRequestException('Origin loan ID is required')

    const originLoan = await this.loanService.findOne(newRefinancingDto.originLoanId)

    if (originLoan.loanStateId !== LOAN_STATES.IN_PROGRESS)
      throw new UnprocessableEntityException('Origin loan must be in progress to be refinanced')

    if (newRefinancingDto.amount < originLoan.debt)
      throw new BadRequestException('New loan amount must be greater than the origin loan debt')

    // Update the origin loan state to "refinanced"
    await this.loanService.rawUpdate(
      originLoan.id,
      { loanStateId: LOAN_STATES.REFINANCED },
      manager,
    )
    // Update the installments of the origin loan to "refinanced"
    await this.setInstallmentsToRefinanced(originLoan.id, manager)

    newRefinancingDto.parentLoanId = newRefinancingDto.originLoanId
    const loanDto = { ...newRefinancingDto, customerId: originLoan.customerId }
    const newLoan = await this.loanService.create(loanDto, manager)

    const refinancingDto = this.generateRefinancingObject(originLoan, newLoan, newRefinancingDto)
    await manager.insert(Refinancing, refinancingDto)

    return { originLoan, newLoan }
  }

  async setInstallmentsToRefinanced(loanId: number, manager: EntityManager) {
    const OMIT_CURRENT_INSTALLMENT = false
    const installments = await this.installmentService.findUnpaidInstallments(
      loanId,
      undefined,
      OMIT_CURRENT_INSTALLMENT,
    )

    const installmentIds = installments.map((installment) => installment.id)

    await this.installmentService.bulkUpdate(
      installmentIds,
      {
        installmentStateId: INSTALLMENT_STATES.REFINANCED,
      },
      manager,
    )
  }
}
