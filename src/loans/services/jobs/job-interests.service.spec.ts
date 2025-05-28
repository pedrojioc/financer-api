import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { parse } from '@formkit/tempo'

import { JobInterestsService } from './job-interests.service'
import { Interest } from 'src/loans/entities/interest.entity'
import { LoanManagementService } from 'src/loans/modules/loans-management/loans-management.service'
import { InstallmentsService } from 'src/loans/modules/installments/installments.service'
import { mockLoan } from '../../../../test/mocks/loans'

import { mockInstallment } from '../../../../test/mocks/installments'

import { DailyInterestService } from 'src/loans/modules/daily-interest/daily-interest.service'
import { CreateInstallmentDto } from 'src/loans/dtos/create-installment.dto'
import { INSTALLMENT_STATES } from 'src/loans/constants/installments'
import { CreateDailyInterestDto } from 'src/loans/modules/daily-interest/create-daily-interest.dto'
import { Loan } from 'src/loans/entities/loan.entity'

const FORMAT_DATE = 'YYYY-MM-DD'

const mockInstallmentService = {
  create: jest.fn(),
  update: jest.fn(),
  getCurrentInstallment: jest.fn(),
}

const mockLoanManagementService = {
  rawUpdate: jest.fn(),
  getLoansByState: jest.fn(),
}

const mockDailyInterestService = {
  create: jest.fn(),
  findOneByDate: jest.fn(),
}

function date(t: Date) {
  // const t = new Date()

  return {
    setMonth: (month: number) => {
      t.setMonth(month)
      return date(t)
    },
    setDay: (day: number) => {
      t.setDate(day)
      return date(t)
    },
    get: () => new Date(t.setUTCHours(0, 0, 0, 0)),
  }
}

describe('JobInterestsService', () => {
  let jobInterestService: JobInterestsService
  let loanManagementService: LoanManagementService
  let installmentService: InstallmentsService
  let dailyInterestService: DailyInterestService

  const repositoryToken = getRepositoryToken(Interest)
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobInterestsService,
        { provide: repositoryToken, useClass: Repository },
        { provide: LoanManagementService, useValue: mockLoanManagementService },
        { provide: InstallmentsService, useValue: mockInstallmentService },
        { provide: DailyInterestService, useValue: mockDailyInterestService },
      ],
    }).compile()

    jobInterestService = module.get<JobInterestsService>(JobInterestsService)
    loanManagementService = module.get<LoanManagementService>(LoanManagementService)
    installmentService = module.get<InstallmentsService>(InstallmentsService)
    dailyInterestService = module.get<DailyInterestService>(DailyInterestService)
  })

  it('should be defined', () => {
    expect(jobInterestService).toBeDefined()
  })

  /*

  it('should update amount of an existing Interest', async () => {
    jest.spyOn(loanManagementService, 'getLoansByState').mockResolvedValueOnce([mockLoan])
    jest.spyOn(installmentService, 'getCurrentInstallment').mockResolvedValueOnce(mockInstallment)
    jest
      .spyOn(loanManagementService, 'rawUpdate')
      .mockResolvedValueOnce({ generatedMaps: [{}], raw: {} })

    const dailyInterest = jobInterestService.getDailyInterest(mockLoan.debt, 10)
    const newInterestAmount = mockInstallment.interest + dailyInterest
    const installmentData = {
      interest: newInterestAmount,
      days: mockInstallment.days + 1,
    }
    const result = await jobInterestService.runDailyInterest()

    expect(dailyInterestService.create).toHaveBeenCalled()
    expect(installmentService.update).toHaveBeenCalledWith(mockInstallment.id, installmentData)
    expect(loanManagementService.rawUpdate).toHaveBeenCalledWith(mockLoan.id, {
      currentInterest: mockLoan.currentInterest + dailyInterest,
    })
    expect(result).toBe(true)
  })

  it('should create a new interest period', async () => {
    jest.clearAllMocks()
    jest.spyOn(loanManagementService, 'getLoansByState').mockResolvedValueOnce([mockLoan])
    jest.spyOn(installmentService, 'getCurrentInstallment').mockResolvedValueOnce(null)
    jest.spyOn(installmentService, 'create').mockResolvedValueOnce(mockInstallment)
    jest
      .spyOn(loanManagementService, 'rawUpdate')
      .mockResolvedValueOnce({ generatedMaps: [{}], raw: {} })

    const dailyInterest = jobInterestService.getDailyInterest(mockLoan.debt, 10)
    const today = new Date()

    const deadline = date(today)
      .setMonth(today.getMonth() + 1)
      .setDay(today.getDate() - 1)
      .get()
    const installmentData: CreateInstallmentDto = {
      loanId: mockLoan.id,
      installmentStateId: INSTALLMENT_STATES.IN_PROGRESS,
      debt: mockLoan.debt,
      startsOn: parse(new Date().toISOString(), 'YYYY-MM-DD'),
      paymentDeadline: deadline,
      days: 1,
      capital: 0,
      interest: dailyInterest,
      total: 0,
      interestPaid: 0,
    }

    const result = await jobInterestService.runDailyInterest()

    expect(installmentService.create).toHaveBeenCalledWith(installmentData)
    expect(dailyInterestService.create).toHaveBeenCalled()
    expect(loanManagementService.rawUpdate).toHaveBeenCalledWith(mockLoan.id, {
      currentInterest: mockLoan.currentInterest + dailyInterest,
    })
    expect(result).toBe(true)
  })

  it('should calculate the days of delay of a loan', () => {
    const deadline = parse(new Date('2024-12-16').toISOString(), FORMAT_DATE)
    const today = parse(new Date().toISOString(), FORMAT_DATE)
    const daysLate = jobInterestService.calculateDaysLate(deadline, today)

    expect(daysLate).toEqual(69)
  })
  */
})
