import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { format, monthDays } from '@formkit/tempo'

import { Loan } from '../entities/loan.entity'
import { CreateLoanDto, UpdateLoanDto } from '../dtos/loans.dto'
import { CustomersService } from 'src/customers/services/customers.service'
import { EmployeesService } from 'src/employees/services/employees.service'

import { FilterLoansDto } from '../dtos/filter-loans.dto'
import { LoanFactoryService } from '../modules/loans-management/loan-factory.service'
import { PaymentPeriod } from '../entities/payment-period.entity'
import { LoanState } from '../entities/loan-state.entity'
import { ROLE } from 'src/roles/constants/role-ids'
import { InstallmentsService } from '../modules/installments/installments.service'
import { INSTALLMENT_STATES } from '../constants/installments'
import { INSTALLMENT_TYPES } from '../shared/constants'
import { CreateContractDto } from '../dtos/create-contract.dto'
import { toWords } from 'src/lib/numbers-to-words'
import { calculateFixedInstallment } from 'src/lib/mathematical-operations'
import { PdfService } from 'src/pdf/pdf.service'
import { currencyFormat } from 'src/utils/number-format'

@Injectable()
export class LoansService {
  constructor(
    @InjectRepository(Loan) private repository: Repository<Loan>,
    private customerService: CustomersService,
    private employeeService: EmployeesService,
    private loanFactory: LoanFactoryService,
    private readonly installmentsService: InstallmentsService,
    private readonly pdfService: PdfService,
  ) {}

  async findOrReturnLoan(loanOrId: Loan | number): Promise<Loan> {
    let loan: Loan

    if (typeof loanOrId === 'number') {
      loan = await this.findOne(loanOrId, ['employee'])
    } else {
      loan = loanOrId
    }

    return loan
  }

  async create(createDto: CreateLoanDto) {
    const disbursementDay = createDto.startAt.getDate()
    if (createDto.needsProrate && disbursementDay === createDto.paymentDay)
      throw new Error(
        'Disbursement day cannot be the same as payment day when prorating is needed.',
      )

    const customer = await this.customerService.findOne(createDto.customerId)
    const employee = await this.employeeService.findOne(createDto.employeeId)
    const loanDto = this.loanFactory.createLoan(createDto, customer, employee)
    loanDto.paymentPeriod = { id: createDto.paymentPeriodId } as PaymentPeriod
    loanDto.loanState = { id: createDto.loanStateId } as LoanState

    const loan = await this.repository.save(loanDto)

    if (loan.installmentTypeId === INSTALLMENT_TYPES.FIXED && createDto.needsProrate) {
      await this.createProratedInstallment(loan, disbursementDay)
    }

    return loan
  }

  async findAll(params: FilterLoansDto, roleId: number, userId: number) {
    const { employeeId } = params

    // ? Query base
    const loans = this.repository
      .createQueryBuilder('loans')
      .leftJoinAndSelect('loans.customer', 'customer')

    // ? Filter by employee
    if (roleId === ROLE.CEO) {
      if (employeeId) {
        loans.innerJoinAndSelect('loans.employee', 'employee', 'employee.id = :employeeId', {
          employeeId,
        })
      } else {
        loans.leftJoinAndSelect('loans.employee', 'employee')
      }
    } else {
      loans.innerJoinAndSelect('loans.employee', 'employee', 'employee.id = :employeeId', {
        employeeId: userId,
      })
    }

    if (params.installmentState) {
      loans
        .innerJoin('installments', 'i', 'loans.id = i.loan_id')
        .where('i.installment_state_id = :installmentStateId', {
          installmentStateId: params.installmentState,
        })
        .andWhere('loan_state_id = :loanState', { loanState: params.state })
    } else {
      loans.where('loan_state_id = :loanState', { loanState: params.state })
    }

    if (params.client) {
      loans.andWhere('customer.name LIKE :client', { client: `${params.client}%` })
      params.page = 1
    }

    loans
      .take(params.itemsPerPage)
      .skip(params.itemsPerPage * (params.page - 1))
      .orderBy('loans.id', 'DESC')

    const [data, counter] = await loans.getManyAndCount()
    return {
      data,
      total: counter,
      currentPage: params.page,
      itemsPerPage: params.itemsPerPage,
    }
  }

  findOne(id: number, relations?: string[]) {
    return this.repository.findOne({
      where: { id },
      relations,
    })
  }

  update(id: number, loanDto: UpdateLoanDto) {
    return this.repository.update(id, loanDto)
  }

  async createProratedInstallment(loan: Loan, disbursementDay: number) {
    const { paymentDay } = loan
    const daysInMonth = monthDays(loan.startAt)
    const prorateDays = this.calculateProrateDays(paymentDay, disbursementDay, daysInMonth)
    const baseMonthDays = 30
    let prorateInterest = 0
    if (prorateDays >= 15) {
      prorateInterest = loan.debt * (loan.interestRate / 100)
    } else {
      const prorateAmount = (loan.amount * loan.interestRate) / 100 / baseMonthDays
      prorateInterest = prorateAmount * prorateDays
    }
    const { startsOn, deadline } = this.installmentsService.generateInstallmentDates(loan, null)
    await this.installmentsService.create({
      loanId: loan.id,
      installmentStateId: INSTALLMENT_STATES.IN_PROGRESS, // Assuming 1 is the ID for 'pending' state
      debt: loan.debt,
      startsOn,
      paymentDeadline: deadline,
      days: prorateDays,
      capital: 0,
      interest: prorateInterest,
      total: prorateInterest,
      interestPaid: 0,
    })
  }

  async generateContract(id: number) {
    const loan = await this.findOne(id, ['customer'])
    if (!loan) throw new NotFoundException()

    const { installmentsNumber } = loan
    const amountInWords = toWords(loan.amount)
    const monthTerm = loan.installmentsNumber > 1 ? 'Meses' : 'Mes'
    const legalInterestRate = 2
    const legalInstallment = calculateFixedInstallment(
      loan.amount,
      legalInterestRate,
      installmentsNumber,
    )
    const installment = await this.installmentsService.findFirstInstallment(loan.id)
    let firstDeadline = installment.paymentDeadline
    if (installment.isProrate) {
      const { deadline } = this.installmentsService.generateInstallmentDates(loan, installment)
      firstDeadline = deadline
    }
    const contractData: CreateContractDto = {
      loanId: id,
      today: format(new Date(), 'long', 'es'),
      amount: currencyFormat(loan.amount),
      amountInWords,
      months: `${installmentsNumber} ${monthTerm}`,
      startsOn: format(loan.startAt, 'long', 'es'),
      legalInterestRate,
      customer: loan.customer.name,
      customerId: loan.customer.idNumber,
      genderId: loan.customer.genderId,
      installmentsNumber,
      legalInstallment: legalInstallment,
      firstInstallmentDeadline: format(firstDeadline, 'long', 'es'),
      lastInstallmentDeadline: format(loan.endAt, 'long', 'es'),
    }

    const pdfBuffer = await this.pdfService.generatePdf('contract', contractData)
    return pdfBuffer
  }

  private calculateProrateDays(paymentDay: number, disbursementDay: number, daysInMonth: number) {
    const prorateDays =
      paymentDay > disbursementDay
        ? paymentDay - disbursementDay
        : daysInMonth - disbursementDay + paymentDay

    return prorateDays
  }
}
