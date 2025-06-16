import { Test, TestingModule } from '@nestjs/testing'
import { PaymentsService } from './payments.service'

import { InterestsService } from '../loans/modules/interests/interests.service'
import { InstallmentsService } from '../installments/installments.service'

import { UnprocessableEntityException } from '@nestjs/common'
import { LoanManagementService } from '../loans-management/loans-management.service'
import { AddPaymentDto } from './dtos/add-payment.dto'
import { INSTALLMENT_STATES } from 'src/loans/modules/installments/constants/installments.c'
import { InstallmentFactoryService } from '../installments/installment-factory.service'
import { mockLoan } from '../../../../test/mocks/loans'
import { mockInstallment } from '../../../../test/mocks/installments'
import { CommissionsService } from 'src/employees/services/commissions.service'
import { EmployeesService } from 'src/employees/services/employees.service'
import { DataSource, EntityManager, InsertResult, QueryRunner } from 'typeorm'
import { Installment } from 'src/loans/modules/installments/entities/installment.entity'

const mockInstallmentService = {
  create: jest.fn(),
  findOne: jest.fn(),
  makePayment: jest.fn(),
  findUnpaidInstallments: jest.fn(),
  calculateDaysLate: jest.fn(),
}
const commissionServiceMock = {
  createCommissionData: jest.fn(),
  transactionalCreate: jest.fn(),
}

const employeeServiceMock = {
  findOne: jest.fn(),
  transactionalUpdateBalance: jest.fn(),
}

const loanManagementServiceMock = {
  findOne: jest.fn(),
  updateLoanAfterPayment: jest.fn(),
}

describe('PaymentsService', () => {
  let paymentService: PaymentsService
  let loanManagementService: LoanManagementService
  let interestService: InterestsService
  let installmentService: InstallmentsService
  let installmentFactoryService: InstallmentFactoryService
  let commissionService: CommissionsService
  let employeeService: EmployeesService
  // mocks for transaction decorator
  let dataSourceMock: Partial<DataSource>
  let queryRunnerMock: Partial<QueryRunner>
  let managerMock: Partial<EntityManager>

  beforeEach(async () => {
    // 🔹 Mock del EntityManager
    managerMock = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      insert: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        relation: jest.fn().mockReturnValue({ of: jest.fn().mockReturnValue({ add: jest.fn() }) }),
      }),
    } as unknown as EntityManager

    // 🔹 Mock de QueryRunner
    queryRunnerMock = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: managerMock,
    } as unknown as QueryRunner

    // 🔹 Mock de DataSource
    dataSourceMock = {
      createQueryRunner: jest.fn().mockReturnValue(queryRunnerMock),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: LoanManagementService, useValue: loanManagementServiceMock },
        {
          provide: InterestsService,
          useValue: { findUnpaidInterests: jest.fn(), getInterestsAmount: jest.fn() },
        },
        { provide: InstallmentsService, useValue: mockInstallmentService },
        { provide: InstallmentFactoryService, useClass: InstallmentFactoryService },
        { provide: CommissionsService, useValue: commissionServiceMock },
        { provide: EmployeesService, useValue: employeeServiceMock },
        { provide: DataSource, useValue: dataSourceMock },
      ],
    }).compile()

    paymentService = module.get<PaymentsService>(PaymentsService)
    loanManagementService = module.get<LoanManagementService>(LoanManagementService)
    interestService = module.get<InterestsService>(InterestsService)
    installmentService = module.get<InstallmentsService>(InstallmentsService)
    installmentFactoryService = module.get<InstallmentFactoryService>(InstallmentFactoryService)
    commissionService = module.get<CommissionsService>(CommissionsService)
    employeeService = module.get<EmployeesService>(EmployeesService)
  })

  it('should be defined', () => {
    expect(paymentService).toBeDefined()
  })

  it('should make a payment to one installment, only interest', async () => {
    jest.clearAllMocks()
    jest.spyOn(loanManagementService, 'findOne').mockResolvedValueOnce(mockLoan)
    jest.spyOn(installmentService, 'findOne').mockResolvedValueOnce(mockInstallment)
    jest.spyOn(installmentService, 'makePayment').mockResolvedValueOnce({} as Installment)
    jest.spyOn(commissionService, 'createCommissionData').mockReturnValueOnce({
      amount: 20000,
      employeeId: 2,
      installmentId: 3,
      interestAmount: 200000,
      rate: 30,
      isPaid: false,
    })
    jest.spyOn(commissionService, 'transactionalCreate').mockResolvedValueOnce(20000)
    jest
      .spyOn(managerMock, 'insert')
      .mockResolvedValueOnce({ generatedMaps: [{}], raw: { insertId: 1 } } as InsertResult)

    const paymentDto: AddPaymentDto = {
      loanId: mockLoan.id,
      paymentMethodId: 1,
      capital: 0,
      installmentId: mockInstallment.id,
      paymentDate: undefined,
    }

    const rs = await paymentService.addPayment(paymentDto)
    expect(installmentService.makePayment).toHaveBeenCalled()
  })

  it('Should throw an error when the payment is only to capital, with overdue installments', async () => {
    jest.clearAllMocks()

    const overdueInstallment = mockInstallment
    overdueInstallment.id = 2
    overdueInstallment.installmentStateId = INSTALLMENT_STATES.OVERDUE
    jest.spyOn(loanManagementService, 'findOne').mockResolvedValueOnce(mockLoan)
    jest.spyOn(installmentService, 'findOne').mockResolvedValueOnce(mockInstallment)
    const spy = jest
      .spyOn(installmentService, 'makePayment')
      .mockResolvedValueOnce({} as Installment)
    jest
      .spyOn(installmentService, 'findUnpaidInstallments')
      .mockResolvedValueOnce([overdueInstallment])

    const paymentDto: AddPaymentDto = {
      loanId: mockLoan.id,
      paymentMethodId: 1,
      capital: 100000,
      installmentId: null,
      paymentDate: undefined,
    }

    await expect(paymentService.addPayment(paymentDto)).rejects.toThrow(
      UnprocessableEntityException,
    )
    expect(spy).not.toHaveBeenCalled()
  })

  it('Should throw an error when capital is 0 and installmentId is empty', async () => {
    jest.clearAllMocks()

    jest.spyOn(loanManagementService, 'findOne').mockResolvedValueOnce(mockLoan)
    jest.spyOn(installmentService, 'findOne').mockResolvedValueOnce(mockInstallment)
    const spy = jest
      .spyOn(installmentService, 'makePayment')
      .mockResolvedValueOnce({} as Installment)
    jest.spyOn(installmentService, 'findUnpaidInstallments').mockResolvedValueOnce([])

    const paymentDto: AddPaymentDto = {
      loanId: mockLoan.id,
      paymentMethodId: 1,
      capital: 0,
      installmentId: null,
      paymentDate: undefined,
    }

    await expect(paymentService.addPayment(paymentDto)).rejects.toThrow(
      UnprocessableEntityException,
    )
    expect(spy).not.toHaveBeenCalled()
  })

  it('should record a partial payment when the amount is less than the interest', async () => {
    jest.clearAllMocks()

    jest.spyOn(loanManagementService, 'findOne').mockResolvedValueOnce(mockLoan)
    jest.spyOn(installmentService, 'findOne').mockResolvedValueOnce(mockInstallment)
    jest.spyOn(installmentService, 'makePayment').mockResolvedValueOnce({} as Installment)
    jest
      .spyOn(managerMock, 'insert')
      .mockResolvedValueOnce({ generatedMaps: [{}], raw: { insertId: 1 } } as InsertResult)

    const paymentDto: AddPaymentDto = {
      loanId: mockLoan.id,
      paymentMethodId: 1,
      capital: 0,
      installmentId: mockInstallment.id,
      customInterest: 50000,
      paymentDate: undefined,
    }

    const rs = await paymentService.addPayment(paymentDto)
    expect(installmentService.makePayment).toHaveBeenCalled()
  })

  // describe('PayOff', () => {
  //   it('should throw NotFoundException if no unpaid interests are found', async () => {
  //     // Arrange
  //     jest.spyOn(loanManagementService, 'findOne').mockResolvedValueOnce({ id: 1 } as Loan)
  //     jest.spyOn(interestService, 'findUnpaidInterests').mockResolvedValueOnce([])

  //     const paymentDto: AddPaymentDto = {
  //       loanId: 3,
  //       paymentMethodId: 3,
  //       installmentStateId: INSTALLMENT_STATES.PAID,
  //       capital: 0,
  //       instalmentId: 1,
  //     }

  //     // Act & Assert
  //     await expect(paymentService.payOff(1, paymentDto)).rejects.toThrow(NotFoundException)
  //   })
  // })
})
