import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from 'src/app.module'
import * as request from 'supertest'
import { Repository } from 'typeorm'

import { Loan } from 'src/loans/entities/loan.entity'
import { getRepositoryToken } from '@nestjs/typeorm'
import { authenticate } from 'test/helpers/login'
import { CreateLoanDto } from 'src/loans/dtos/loans.dto'
import { LOAN_STATES } from 'src/loans/shared/constants'
import { INSTALLMENT_STATES } from 'src/loans/modules/installments/constants/installments.c'
import { Interest } from 'src/loans/entities/interest.entity'

import { Installment } from 'src/loans/modules/installments/entities/installment.entity'
import { AddPaymentDto } from 'src/loans/modules/payments/dtos/new-payment.dto'
import { DatabaseSeeder } from 'src/database/database-seeder'

describe('LoansController (e2e)', () => {
  let app: INestApplication
  let seeder: DatabaseSeeder
  let loanRepository: Repository<Loan>
  let interestRepository: Repository<Interest>
  let installmentRepository: Repository<Installment>
  let hostServer: string
  let accessToken: string

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [DatabaseSeeder],
    }).compile()

    loanRepository = moduleFixture.get<Repository<Loan>>(getRepositoryToken(Loan))
    interestRepository = moduleFixture.get<Repository<Interest>>(getRepositoryToken(Interest))
    installmentRepository = moduleFixture.get<Repository<Installment>>(
      getRepositoryToken(Installment),
    )

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

  it('/loans (POST)', async () => {
    const data: CreateLoanDto = {
      customerId: 1,
      employeeId: 1,
      paymentPeriodId: 1,
      amount: 2000000,
      interestRate: 10,
      installmentsNumber: 6,
      startAt: new Date(),
      endAt: new Date(new Date().setMonth(new Date().getMonth() + 6)),
      loanStateId: LOAN_STATES.IN_PROGRESS,
      commissionRate: 25,
    }
    return request(hostServer)
      .post('/loans')
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(data)
      .expect(201)
      .expect(({ body }) => {
        expect(body).toHaveProperty('id')
      })
  })

  /*
   */

  /*
  it('/loans/:id/pay-off (POST)', async () => {
    const loan = await loanRepository.findOne({ where: { loanStateId: LOAN_STATES.IN_PROGRESS } })
    const payOffData: AddPaymentDto = {
      loanId: loan.id,
      paymentMethodId: 1,
      capital: 0,
      instalmentId: 0
    }

    const response = await request(hostServer)
      .post(`/loans/${payOffData.loanId}/pay-off`)
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(payOffData)
      .expect(201)

    const loanAfterPayOff = await loanRepository.findOne({ where: { id: loan.id } })
    const installment = await installmentRepository.findOne({
      where: { id: response.body.raw.insertId },
    })
    expect(Number(loanAfterPayOff.debt)).toEqual(0)
    expect(Number(installment.capital)).toEqual(Number(loan.debt))
    expect(loanAfterPayOff.loanStateId).toEqual(LOAN_STATES.FINALIZED)
  })

  it('/loans/:id/pay-off (POST) - WITH CUSTOM INTEREST', async () => {
    const loan = await loanRepository.findOne({ where: { loanStateId: LOAN_STATES.IN_PROGRESS } })
    const interestToPay = 500_000
    const payOffData: AddPaymentDto = {
      loanId: loan.id,
      paymentMethodId: 1,
      installmentStateId: INSTALLMENT_STATES.PAID,
      capital: 0,
      customInterest: interestToPay,
      interestIds: [],
    }

    const response = await request(hostServer)
      .post(`/loans/${payOffData.loanId}/pay-off`)
      .set({ Authorization: `Bearer ${accessToken}` })
      .send(payOffData)
      .expect(201)

    const loanAfterPayOff = await loanRepository.findOne({ where: { id: loan.id } })
    const installment = await installmentRepository.findOne({
      where: { id: response.body.raw.insertId },
    })
    expect(Number(loanAfterPayOff.debt)).toEqual(0)
    expect(Number(installment.capital)).toEqual(Number(loan.debt))
    expect(loanAfterPayOff.loanStateId).toEqual(LOAN_STATES.FINALIZED)
    expect(Number(installment.interest)).toEqual(interestToPay)
  })
  */
})
