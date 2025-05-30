import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, MoreThan, Repository } from 'typeorm'

import { Loan } from 'src/loans/entities/loan.entity'
import { LOAN_STATES, LoanStateValueTypes } from 'src/loans/shared/constants'
import { CreateLoanDto, UpdateLoanDto } from 'src/loans/dtos/loans.dto'
import { LoanFactoryService } from './loan-factory.service'

@Injectable()
export class LoanManagementService {
  constructor(
    @InjectRepository(Loan) private repository: Repository<Loan>,
    private readonly loanFactoryService: LoanFactoryService,
  ) {}

  async create(loanDto: CreateLoanDto, manager?: EntityManager) {
    const queryBuilder = manager ? manager : this.repository
    const loanObject = this.loanFactoryService.generateLoanObject(loanDto)
    const queryRs = await queryBuilder.insert(Loan, loanObject)
    const loan = await queryBuilder.findOneBy(Loan, { id: queryRs.raw.insertId })
    return loan
  }

  findOne(id: number, relations?: string[]) {
    return this.repository.findOne({
      where: { id },
      relations,
    })
  }

  async findOrReturnLoan(loanOrId: Loan | number): Promise<Loan> {
    let loan: Loan

    if (typeof loanOrId === 'number') {
      loan = await this.findOne(loanOrId, ['employee'])
    } else {
      loan = loanOrId
    }

    return loan
  }

  getLoansByState(loanStateId: LoanStateValueTypes) {
    return this.repository
      .createQueryBuilder('loans')
      .where('loan_state_id = :id', { id: loanStateId })
      .getMany()
  }

  getLoansInDefault(relations: string[] | object) {
    return this.repository.find({
      where: { loanStateId: LOAN_STATES.IN_PROGRESS, daysLate: MoreThan(0) },
      relations: relations,
    })
  }

  async rawUpdate(id: number, updateLoanDto: UpdateLoanDto, manager?: EntityManager) {
    const queryBuilder = manager ? manager : this.repository
    return await queryBuilder
      .createQueryBuilder()
      .update(Loan)
      .set(updateLoanDto)
      .where('id = :id', { id })
      .execute()
  }

  async transactionalUpdate(manager: EntityManager, id: number, updateLoanDto: UpdateLoanDto) {
    return await manager
      .createQueryBuilder()
      .update(Loan)
      .set(updateLoanDto)
      .where('id = :id', { id })
      .execute()
  }

  async updateLoanAfterPayment(
    manager: EntityManager,
    loan: Loan,
    interestPaid: number,
    capital: number,
    daysLate: number,
    commission: number,
    installmentsPaid: number,
  ) {
    const loanData = this.loanFactoryService.valuesAfterPayment(
      loan,
      interestPaid,
      capital,
      daysLate,
      commission,
      installmentsPaid,
    )

    return await this.transactionalUpdate(manager, loan.id, loanData)
  }
}
