import { Test, TestingModule } from '@nestjs/testing'
import { InstallmentFactoryService } from './installment-factory.service'
import { AddPaymentDto } from '../payments/dtos/new-payment.dto'
import { mockInstallment } from '../../../../test/mocks/installments'
import { INSTALLMENT_STATES } from 'src/loans/modules/installments/constants/installments.c'
import { BadRequestException, UnprocessableEntityException } from '@nestjs/common'

describe('InstallmentFactoryService', () => {
  let installmentFactoryService: InstallmentFactoryService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InstallmentFactoryService],
    }).compile()

    installmentFactoryService = module.get<InstallmentFactoryService>(InstallmentFactoryService)
  })

  it('should return the installment status as paid when payment is complete - No custom interest', () => {
    jest.clearAllMocks()
    const installment = mockInstallment
    installment.installmentStateId = INSTALLMENT_STATES.AWAITING_PAYMENT

    const paymentDto: AddPaymentDto = {
      loanId: 1,
      paymentMethodId: 1,
      capital: 0,
      installmentId: installment.id,
    }

    const data = installmentFactoryService.update(installment, paymentDto)

    expect(data.interestPaid).toEqual(installment.interest)
    expect(data.installmentStateId).toEqual(INSTALLMENT_STATES.PAID)
  })

  it('should add the new payment to the existing partial payment and mark it as payment', () => {
    jest.clearAllMocks()
    const installment = mockInstallment
    installment.installmentStateId = INSTALLMENT_STATES.AWAITING_PAYMENT
    installment.interestPaid = 100_000
    const interestToPay = 100_000
    const paymentDto: AddPaymentDto = {
      loanId: 1,
      paymentMethodId: 1,
      capital: 0,
      installmentId: installment.id,
      customInterest: interestToPay,
    }

    const data = installmentFactoryService.update(installment, paymentDto)

    expect(data.interestPaid).toBeGreaterThanOrEqual(installment.interest)
    expect(data.installmentStateId).toEqual(INSTALLMENT_STATES.PAID)
  })

  it('should not change status when payment is not complete', () => {
    jest.clearAllMocks()
    const installment = mockInstallment
    installment.installmentStateId = INSTALLMENT_STATES.AWAITING_PAYMENT
    installment.interestPaid = 50_000
    const interestToPay = 100_000
    const paymentDto: AddPaymentDto = {
      loanId: 1,
      paymentMethodId: 1,
      capital: 0,
      installmentId: installment.id,
      customInterest: interestToPay,
    }

    const data = installmentFactoryService.update(installment, paymentDto)

    expect(data.interestPaid).toEqual(installment.interestPaid + interestToPay)
    expect(data.installmentStateId).toEqual(undefined)
  })

  it('should throw an error when the payment does not match', () => {
    jest.clearAllMocks()
    const installment = mockInstallment
    installment.installmentStateId = INSTALLMENT_STATES.AWAITING_PAYMENT
    installment.interestPaid = 50_000
    const interestToPay = installment.interest
    const paymentDto: AddPaymentDto = {
      loanId: 1,
      paymentMethodId: 1,
      capital: 0,
      installmentId: installment.id,
    }

    expect(() => installmentFactoryService.update(installment, paymentDto)).toThrow(
      BadRequestException,
    )
  })

  it('should throw an error if the principal payment is greater than 0 and there is outstanding interest', () => {
    jest.clearAllMocks()
    const installment = mockInstallment
    installment.installmentStateId = INSTALLMENT_STATES.AWAITING_PAYMENT
    installment.interestPaid = 0
    const capital = 100_000
    const interestToPay = 100_000
    const paymentDto: AddPaymentDto = {
      loanId: 1,
      paymentMethodId: 1,
      capital,
      installmentId: installment.id,
      customInterest: interestToPay,
    }

    expect(() => installmentFactoryService.update(installment, paymentDto)).toThrow(
      UnprocessableEntityException,
    )
  })
})
