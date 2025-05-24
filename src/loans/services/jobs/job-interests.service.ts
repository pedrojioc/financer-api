import { Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import {
  addDay,
  addMonth,
  diffDays,
  format,
  isAfter,
  isEqual,
  monthDays,
  monthEnd,
  parse,
} from '@formkit/tempo'
import { INTEREST_STATE } from '../../constants/interests'
import { Interest } from '../../entities/interest.entity'
import { INSTALLMENT_TYPES, LOAN_STATES, PAYMENT_PERIODS } from 'src/loans/shared/constants'
import { LoanManagementService } from 'src/loans/modules/loans-management/loans-management.service'
import { Loan } from 'src/loans/entities/loan.entity'
import { InstallmentsService } from 'src/loans/modules/installments/installments.service'
import { DailyInterestService } from 'src/loans/modules/daily-interest/daily-interest.service'
import { Installment } from 'src/loans/entities/installment.entity'
import { UpdateInstallmentDto } from 'src/loans/dtos/update-installment.dto'
import { INSTALLMENT_STATES } from 'src/loans/constants/installments'
import { CreateInstallmentDto } from 'src/loans/dtos/create-installment.dto'
import { UpdateLoanDto } from 'src/loans/dtos/loans.dto'
import { pre } from 'telegraf/typings/format'

@Injectable()
export class JobInterestsService {
  private DAYS_OF_INTEREST = 30
  private DATE_FORMAT = 'YYYY-MM-DD'
  private TODAY = parse(new Date().toISOString(), this.DATE_FORMAT)
  constructor(
    @InjectRepository(Interest) private repository: Repository<Interest>,
    private installmentService: InstallmentsService,
    private dailyInterestService: DailyInterestService,
    private loanManagementService: LoanManagementService,
  ) {}

  // -------------------------------
  // COMMON METHODS
  // -------------------------------
  getDailyInterest(debt: number, interestRate: number) {
    const MONTH_DAYS = 30
    const monthlyInterest = (debt * interestRate) / 100
    return monthlyInterest / MONTH_DAYS
  }

  calculateDaysLate(deadline: Date, today: Date) {
    return diffDays(today, deadline)
  }

  generateInstallmentDates(
    loan: Loan,
    prevInstallment: Installment | null,
  ): { startsOn: Date; deadline: Date } {
    let startsOn: Date
    let deadline: Date

    if (!prevInstallment) {
      const startDay = loan.startAt.getDate()
      startsOn = addDay(loan.startAt, 1)
      if (loan.paymentDay > startDay) {
        // ? La fecha de pago es en el mismo mes que inicio el crédito
        deadline = loan.startAt
      } else {
        deadline = addMonth(loan.startAt, 1)
      }
    } else {
      startsOn = addDay(prevInstallment.paymentDeadline, 1)
      deadline = addMonth(prevInstallment.paymentDeadline, 1)
    }

    const isOverflow = monthDays(deadline) < loan.paymentDay
    if (isOverflow) {
      deadline = monthEnd(deadline)
    } else {
      deadline.setDate(loan.paymentDay)
    }

    return { startsOn, deadline }
  }

  private isTodayTheDeadline(deadline: Date): boolean {
    return isEqual(deadline, format(this.TODAY, this.DATE_FORMAT))
  }

  // -------------------------------
  // METHODS FOR FLEXIBLE CREDITS
  // -------------------------------

  private generateUpdateInterestDto(
    installment: Installment,
    dailyInterest: number,
  ): UpdateInstallmentDto {
    let interest = Number(installment.interest)

    const days = installment.days + 1
    if (installment.days < 15) {
      interest = interest + dailyInterest
    } else if (installment.days === 15) {
      interest = interest + dailyInterest * 16
    }

    return {
      interest,
      days,
    }
  }

  private generateFlexibleInstallmentData(
    loan: Loan,
    installment: Installment,
    dailyInterest: number,
  ): CreateInstallmentDto {
    const { startsOn, deadline } = this.generateInstallmentDates(loan, installment)
    return {
      loanId: loan.id,
      installmentStateId: INSTALLMENT_STATES.IN_PROGRESS,
      debt: loan.debt,
      startsOn,
      paymentDeadline: deadline,
      days: 1,
      capital: 0,
      interest: dailyInterest,
      interestPaid: 0,
      total: 0,
    }
  }

  private async processFlexibleLoans(loan: Loan, today: Date): Promise<void> {
    const dailyInterestAmount = this.getDailyInterest(loan.debt, loan.interestRate)
    let loanValues: UpdateLoanDto = { currentInterest: loan.currentInterest + dailyInterestAmount }

    let installment = await this.installmentService.getLastInstallment(loan.id)
    if (installment && isAfter(installment.paymentDeadline, today)) {
      const updatedValues = this.generateUpdateInterestDto(installment, dailyInterestAmount)

      if (this.isTodayTheDeadline(installment.paymentDeadline)) {
        updatedValues.installmentStateId = INSTALLMENT_STATES.AWAITING_PAYMENT
      }
      await this.installmentService.update(installment.id, updatedValues)
    } else {
      const newInstallment = this.generateFlexibleInstallmentData(
        loan,
        installment,
        dailyInterestAmount,
      )
      installment = await this.installmentService.create(newInstallment)
      loanValues.currentInstallmentNumber = loan.currentInstallmentNumber + 1
    }

    // Update current interest on loans table
    await this.loanManagementService.rawUpdate(loan.id, loanValues)
  }

  // -------------------------------
  // METHODS FOR FIXED CREDITS (PROGRESSIVE GENERATION)
  // -------------------------------

  /**
   * Generates the start date and payment deadline for a fixed installment.
   * @param loan The loan object containing the start date and other details.
   * @param installmentNumber El numero de la cuota a generar.
   * @returns An object containing the start date and payment deadline for the installment.
   */
  private generateFixedInstallmentData(
    loan: Loan,
    installment: Installment,
    installmentNumber: number,
  ): CreateInstallmentDto {
    const { startsOn, deadline } = this.generateInstallmentDates(loan, installment)

    const interestRate = loan.interestRate / 100
    const installmentAmount =
      (loan.amount * interestRate) / (1 - Math.pow(1 + interestRate, -loan.installmentsNumber))
    const prevBalance =
      loan.amount * Math.pow(1 + interestRate, installmentNumber - 1) -
      installmentAmount * ((Math.pow(1 + interestRate, installmentNumber - 1) - 1) / interestRate)

    const interest = prevBalance * interestRate
    const amortization = installmentAmount - interest
    const total = interest + amortization
    return {
      loanId: loan.id,
      installmentStateId: INSTALLMENT_STATES.IN_PROGRESS,
      debt: loan.debt,
      startsOn,
      paymentDeadline: deadline,
      days: 1,
      capital: amortization,
      interest,
      interestPaid: 0,
      total,
    }
  }

  private async processFixedLoans(loan: Loan, today: Date) {
    const currentInstallment = await this.installmentService.getLastInstallment(loan.id)
    if (currentInstallment && isAfter(currentInstallment.paymentDeadline, today)) {
      const updatedValues: UpdateInstallmentDto = {
        days: currentInstallment.days + 1,
      }
      if (this.isTodayTheDeadline(currentInstallment.paymentDeadline)) {
        updatedValues.installmentStateId = INSTALLMENT_STATES.AWAITING_PAYMENT
      }
      await this.installmentService.update(currentInstallment.id, updatedValues)
      return true
    } else {
      if (loan.currentInstallmentNumber >= loan.installmentsNumber) return true
      // Generate next installment
      const installmentNumber = loan.currentInstallmentNumber + 1
      const installmentData = this.generateFixedInstallmentData(
        loan,
        currentInstallment,
        installmentNumber,
      )
      await this.installmentService.create(installmentData)
      await this.loanManagementService.rawUpdate(loan.id, {
        currentInstallmentNumber: installmentNumber,
        currentInterest: loan.currentInterest + installmentData.interest,
      })
    }
  }

  async runDailyInterest(today = this.TODAY) {
    const loans = await this.loanManagementService.getLoansByState(LOAN_STATES.IN_PROGRESS)

    for (const loan of loans) {
      if (loan.id !== 65) continue
      if (loan.installmentTypeId === INSTALLMENT_TYPES.FIXED) {
        await this.processFixedLoans(loan, today)
      } else {
        await this.processFlexibleLoans(loan, today)
      }
    }
    return true
  }

  async getOverdueInterests(todayString: string) {
    return await this.repository
      .createQueryBuilder('interest')
      .where(
        '(interest_state_id = :interestStateAwaiting OR interest_state_id = :interestStateOverdue) AND deadline < :currentDate',
        {
          interestStateAwaiting: INTEREST_STATE.AWAITING_PAYMENT,
          interestStateOverdue: INTEREST_STATE.OVERDUE,
          currentDate: todayString,
        },
      )
      .getMany()
  }

  async checkOverduePayments() {
    const today = this.TODAY
    const overdueStates = {
      [INSTALLMENT_STATES.AWAITING_PAYMENT]: true,
      [INSTALLMENT_STATES.IN_PROGRESS]: true,
    }

    const loans = await this.loanManagementService.getLoansByState(LOAN_STATES.IN_PROGRESS)
    const overdueInstallmentIds = []
    for (const loan of loans) {
      const installments = await this.installmentService.findUnpaidInstallments(loan.id)

      let daysLate = 0
      for (const installment of installments) {
        const { installmentStateId } = installment
        // Check and store if the installment state needs to be updated
        if (overdueStates[installmentStateId]) overdueInstallmentIds.push(installment.id)

        // Calcula y almacena los días en mora de cada cuota
        const days = this.calculateDaysLate(installment.paymentDeadline, today)
        if (days > daysLate) daysLate = days
      }

      await this.loanManagementService.rawUpdate(loan.id, { daysLate })
    }

    await this.installmentService.bulkUpdate(overdueInstallmentIds, {
      installmentStateId: INSTALLMENT_STATES.OVERDUE,
    })

    return true
  }

  async setCurrentInstallmentNumber() {
    const loans = await this.loanManagementService.getLoansByState(LOAN_STATES.IN_PROGRESS)
    for (const loan of loans) {
      const installmentsNumber = await this.installmentService.countInstallments(loan.id)
      await this.loanManagementService.rawUpdate(loan.id, {
        currentInstallmentNumber: installmentsNumber,
      })
    }
  }
}
