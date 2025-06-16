import { Repository } from 'typeorm'
import { INestApplication } from '@nestjs/common'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'

import { AppModule } from 'src/app.module'
import { Loan } from 'src/loans/entities/loan.entity'
import { Installment } from 'src/loans/modules/installments/entities/installment.entity'
import { DatabaseSeeder } from 'src/database/database-seeder'
import { authenticate } from 'test/helpers/login'
import { INSTALLMENT_STATES } from 'src/loans/modules/installments/constants/installments.c'
import { AddPaymentDto } from 'src/loans/modules/payments/dtos/add-payment.dto'
import { Commission } from 'src/employees/entities/commission.entity'

describe('PaymentsController (e2e)', () => {
  let app: INestApplication
  let seeder: DatabaseSeeder
  let loanRepository: Repository<Loan>
  let installmentRepository: Repository<Installment>
  let commissionRepository: Repository<Commission>
  let hostServer: string
  let accessToken: string

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [DatabaseSeeder],
    }).compile()

    loanRepository = moduleFixture.get<Repository<Loan>>(getRepositoryToken(Loan))
    installmentRepository = moduleFixture.get<Repository<Installment>>(
      getRepositoryToken(Installment),
    )
    commissionRepository = moduleFixture.get<Repository<Commission>>(getRepositoryToken(Commission))

    app = moduleFixture.createNestApplication()
    await app.init()

    // Initialize seeder
    seeder = moduleFixture.get(DatabaseSeeder)

    hostServer = app.getHttpServer()
    accessToken = await authenticate(hostServer)
  })

  afterAll(async () => {
    await app.close()
  })

  it('/payments (POST) - CREATE: WITHOUT CAPITAL', async () => {
    const loan = await seeder.seedLoans()
    const installmentRs = await seeder.seedInstallment(loan.id, INSTALLMENT_STATES.AWAITING_PAYMENT)
    const installment = await installmentRepository.findOne({
      where: { id: installmentRs.raw.insertId },
    })
    if (!loan) throw new Error('Loan not found')

    const data: AddPaymentDto = {
      loanId: loan.id,
      paymentMethodId: 1,
      capital: 0,
      installmentId: installment.id,
    }

    const response = await request(hostServer)
      .post(`/payments`)
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(data)
      .expect(201)

    const installmentAfterPayment = await installmentRepository.findOneBy({
      id: installment.id,
    })
    const loanAfterPayment = await loanRepository.findOne({ where: { id: loan.id } })

    expect(Number(installmentAfterPayment.capital)).toEqual(0)
    expect(Number(loanAfterPayment.debt)).toEqual(loan.debt)
    expect(installmentAfterPayment.installmentStateId).toEqual(INSTALLMENT_STATES.PAID)

    return response
  })

  it('/payments (POST) - CREATE: INTEREST + CAPITAL', async () => {
    const loan = await seeder.seedLoans()
    const installmentRs = await seeder.seedInstallment(loan.id, INSTALLMENT_STATES.AWAITING_PAYMENT)
    const installmentId = installmentRs.raw.insertId

    if (!loan) throw new Error('Loan not found')

    const capital = 500_000
    const data: AddPaymentDto = {
      loanId: loan.id,
      paymentMethodId: 1,
      capital: capital,
      installmentId,
    }

    const response = await request(hostServer)
      .post(`/payments`)
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(data)
      .expect(201)

    const installment = await installmentRepository.findOneBy({ id: installmentId })
    const loanAfterPayment = await loanRepository.findOne({ where: { id: loan.id } })

    const expectedDebt = Number(loan.debt) - capital

    expect(Number(installment.capital)).toEqual(capital)
    expect(Number(loanAfterPayment.debt)).toEqual(expectedDebt)
    expect(installment.installmentStateId).toEqual(INSTALLMENT_STATES.PAID)

    return response
  })

  it('/payments (POST) - REJECT: INTEREST + CAPITAL WITH PENDING INTEREST', async () => {
    const loan = await seeder.seedLoans()
    const installmentRs = await seeder.seedInstallment(loan.id, INSTALLMENT_STATES.OVERDUE)
    await seeder.seedInstallment(loan.id, INSTALLMENT_STATES.AWAITING_PAYMENT)
    const installmentId = installmentRs.raw.insertId

    if (!loan) throw new Error('Loan not found')

    const capital = 500_000
    const data: AddPaymentDto = {
      loanId: loan.id,
      paymentMethodId: 1,
      capital,
      installmentId,
    }

    const response = await request(hostServer)
      .post(`/payments`)
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(data)
      .expect(422)

    return response
  })

  it('/payments (POST) - CREATE: ONLY CAPITAL NO PENDING INTEREST', async () => {
    const deadline = new Date(new Date().setDate(new Date().getDate() + 1))
    const loan = await seeder.seedLoans()
    const installmentRs = await seeder.seedInstallment(
      loan.id,
      INSTALLMENT_STATES.IN_PROGRESS,
      deadline,
    )

    if (!loan) throw new Error('Loan not found')

    const capital = 200_000
    const data: AddPaymentDto = {
      loanId: loan.id,
      capital,
      installmentId: null,
      paymentMethodId: 1,
    }

    const response = await request(hostServer)
      .post(`/payments`)
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(data)
      .expect(201)

    const installmentAfterPayment = await installmentRepository.findOne({
      where: { loanId: loan.id },
      order: { id: 'desc' },
    })

    const loanAfterPayment = await loanRepository.findOne({ where: { id: loan.id } })

    const expectedDebt = Number(loan.debt) - capital

    expect(Number(installmentAfterPayment.interest)).toEqual(0)
    expect(Number(installmentAfterPayment.capital)).toEqual(capital)
    expect(Number(loanAfterPayment.debt)).toEqual(expectedDebt)

    return response
  })

  it('/payments (POST) - REJECT: ONLY CAPITAL WITH PENDING INTEREST', async () => {
    const loan = await seeder.seedLoans()
    const installmentRs = await seeder.seedInstallment(loan.id, INSTALLMENT_STATES.AWAITING_PAYMENT)

    if (!loan) throw new Error('Loan not found')

    const data: AddPaymentDto = {
      loanId: loan.id,
      paymentMethodId: 1,
      capital: 200000,
      installmentId: null,
    }
    const response = await request(hostServer)
      .post(`/payments`)
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(data)
      .expect(422)

    return response
  })

  it('/payments (POST) - UPDATE: PARTIAL PAYMENT', async () => {
    const loan = await seeder.seedLoans()
    const installmentRs = await seeder.seedInstallment(loan.id, INSTALLMENT_STATES.OVERDUE)
    const installment = await installmentRepository.findOne({
      where: { id: installmentRs.raw.insertId },
    })

    if (!loan) throw new Error('Loan not found')

    const capital = 0
    const interestToPay = 50_000
    const data: AddPaymentDto = {
      loanId: loan.id,
      paymentMethodId: 1,
      capital,
      installmentId: installment.id,
      customInterest: interestToPay,
    }

    await request(hostServer)
      .post(`/payments`)
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(data)
      .expect(201)

    const installmentAfterPayment = await installmentRepository.findOne({
      where: { loanId: loan.id },
      order: { id: 'desc' },
    })

    const loanAfterPayment = await loanRepository.findOne({ where: { id: loan.id } })

    const expectedDebt = Number(loan.debt)

    expect(Number(installmentAfterPayment.interestPaid)).toEqual(interestToPay)
    expect(Number(installmentAfterPayment.capital)).toEqual(capital)
    expect(installmentAfterPayment.installmentStateId).toEqual(INSTALLMENT_STATES.OVERDUE)
    expect(Number(loanAfterPayment.debt)).toEqual(expectedDebt)
  })

  it('/payments (POST) - UPDATE: Add more partial', async () => {
    const loan = await seeder.seedLoans()
    const installmentRs = await seeder.seedInstallment(loan.id, INSTALLMENT_STATES.AWAITING_PAYMENT)
    const installmentId = installmentRs.raw.insertId
    await installmentRepository.update(installmentId, { interestPaid: 100_000 })
    const installment = await installmentRepository.findOne({
      where: { id: installmentId },
    })
    if (!loan) throw new Error('Loan not found')

    const interestToPay = 50_000
    const data: AddPaymentDto = {
      installmentId: installment.id,
      loanId: loan.id,
      paymentMethodId: 1,
      capital: 0,
      customInterest: interestToPay,
    }

    const response = await request(hostServer)
      .post(`/payments`)
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(data)
      .expect(201)

    const installmentAfterPayment = await installmentRepository.findOneBy({
      id: installment.id,
    })
    const expectedAmount = installment.interestPaid + interestToPay

    expect(Number(installmentAfterPayment.capital)).toEqual(0)
    expect(Number(installmentAfterPayment.interestPaid)).toEqual(expectedAmount)
    expect(installmentAfterPayment.installmentStateId).toEqual(installment.installmentStateId)

    return response
  })

  it('/payments (POST) - REJECT: PARTIAL PAYMENT WITH CAPITAL', async () => {
    const loan = await seeder.seedLoans()
    const installmentRs = await seeder.seedInstallment(loan.id, INSTALLMENT_STATES.AWAITING_PAYMENT)
    const installmentId = installmentRs.raw.insertId

    if (!loan) throw new Error('Loan not found')

    const data: AddPaymentDto = {
      loanId: loan.id,
      paymentMethodId: 1,
      capital: 200000,
      installmentId,
      customInterest: 50_000,
    }
    const response = await request(hostServer)
      .post(`/payments`)
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(data)
      .expect(422)

    return response
  })

  describe('Commissions', () => {
    it('/payments (POST) - CREATE: COMMISSION', async () => {
      const employeeId = 2
      const commissionRate = 25
      const loan = await seeder.seedLoans(employeeId, commissionRate)
      const installmentRs = await seeder.seedInstallment(
        loan.id,
        INSTALLMENT_STATES.AWAITING_PAYMENT,
      )
      const installmentId = installmentRs.raw.insertId
      let installment = await installmentRepository.findOne({
        where: { id: installmentId },
      })

      if (!loan) throw new Error('Loan not found')

      const capital = 0
      const data: AddPaymentDto = {
        loanId: loan.id,
        paymentMethodId: 1,
        capital,
        installmentId,
      }

      const response = await request(hostServer)
        .post(`/payments`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .send(data)
        .expect(201)

      const commission = await commissionRepository.findOne({
        where: { installmentId },
      })

      installment = await installmentRepository.findOne({
        where: { id: installmentId },
      })

      const expectedCommission = installment.interestPaid * 0.3
      expect(Number(commission.amount)).toEqual(expectedCommission)
      return response
    })

    it('/payments (POST) - DO NOT CREATE: COMMISSION', async () => {
      const loan = await seeder.seedLoans(2)
      const installmentRs = await seeder.seedInstallment(
        loan.id,
        INSTALLMENT_STATES.AWAITING_PAYMENT,
      )
      const installmentId = installmentRs.raw.insertId
      let installment = await installmentRepository.findOne({
        where: { id: installmentId },
      })

      if (!loan) throw new Error('Loan not found')

      const capital = 0
      const data: AddPaymentDto = {
        loanId: loan.id,
        paymentMethodId: 1,
        capital,
        installmentId,
        customInterest: 50_000,
      }

      const response = await request(hostServer)
        .post(`/payments`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .send(data)
        .expect(201)

      const commission = await commissionRepository.findOne({
        where: { installmentId },
      })

      installment = await installmentRepository.findOne({
        where: { id: installmentId },
      })

      expect(commission).toBeNull()
      return response
    })

    it('/payments (POST) - CREATE: COMMISSION WITH PREVIOUS INTEREST PAID', async () => {
      const loan = await seeder.seedLoans(2)
      const installmentRs = await seeder.seedInstallment(
        loan.id,
        INSTALLMENT_STATES.AWAITING_PAYMENT,
        new Date(), // deadline
        200_000, // interest
      )
      const installmentId = installmentRs.raw.insertId

      const installment = await installmentRepository.findOne({
        where: { id: installmentId },
      })

      if (!loan) throw new Error('Loan not found')

      const capital = 0
      const data: AddPaymentDto = {
        loanId: loan.id,
        paymentMethodId: 1,
        capital,
        installmentId,
      }

      await request(hostServer)
        .post(`/payments`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({ ...data, customInterest: 50_000 })
        .expect(201)

      const response = await request(hostServer)
        .post(`/payments`)
        .set({ Authorization: `Bearer ${accessToken}` })
        .send({ ...data, customInterest: 150_000 })
        .expect(201)

      const commission = await commissionRepository.findOne({
        where: { installmentId },
      })

      const expectedCommission = installment.interest * 0.3

      expect(commission.amount).toEqual(expectedCommission)
      return response
    })
  })
})
