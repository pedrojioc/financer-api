import { Test, TestingModule } from '@nestjs/testing'
import { InstallmentsService } from './installments.service'
import { MockType, dataSourceMockFactory } from '../../../../test/mocks/data-source.mock'
import { DataSource, Repository } from 'typeorm'
import { Installment } from 'src/loans/entities/installment.entity'
import { getRepositoryToken } from '@nestjs/typeorm'
import { LoanManagementService } from '../loans-management/loans-management.service'
import { LoanFactoryService } from '../loans-management/loan-factory.service'
import { Loan } from 'src/loans/entities/loan.entity'
import { mockLoan } from '../../../../test/mocks/loans'
import { mockInstallment } from '../../../../test/mocks/installments'

describe('InstallmentsService', () => {
  let service: InstallmentsService
  let dataSource: MockType<DataSource>
  let repository: Repository<Installment>
  let loanService: LoanManagementService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InstallmentsService,
        { provide: getRepositoryToken(Installment), useClass: Repository },
        { provide: DataSource, useFactory: dataSourceMockFactory },
        { provide: LoanFactoryService, useValue: { findOne: jest.fn() } },
      ],
    }).compile()

    service = module.get<InstallmentsService>(InstallmentsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should calculate the first installment dates', () => {
    const paymentDay = 12
    const loan: Loan = { ...mockLoan, startAt: new Date(2025, 0, 15), paymentDay }
    const installment = null // { ...mockInstallment }
    const { startsOn, deadline } = service.generateInstallmentDates(loan, installment)

    console.log('startsOn', startsOn)
    console.log('deadline', deadline)
    expect(startsOn).toBeDefined()
    expect(deadline).toBeDefined()
    expect(startsOn).toEqual(new Date(2025, 0, 16))
    expect(deadline).toEqual(new Date(2025, 1, paymentDay))
  })

  it('should calculate installment dates', () => {
    const paymentDay = 30
    const loan: Loan = { ...mockLoan, startAt: new Date(2025, 0, 15), paymentDay }
    const installment = {
      ...mockInstallment,
      startsOn: new Date(2025, 0, 31),
      paymentDeadline: new Date(2025, 1, 28),
    }
    const { startsOn, deadline } = service.generateInstallmentDates(loan, installment)

    console.log('startsOn', startsOn)
    console.log('deadline', deadline)
    expect(startsOn).toBeDefined()
    expect(deadline).toBeDefined()
    expect(startsOn).toEqual(new Date(2025, 2, 1))
    expect(deadline).toEqual(new Date(2025, 2, 30))
  })
})
