import { Injectable } from '@nestjs/common'

import { diffDays, format, isAfter, isEqual, parse } from '@formkit/tempo'

import { LOAN_STATES } from 'src/loans/shared/constants'
import { LoanManagementService } from 'src/loans/modules/loans-management/loans-management.service'
import { Loan } from 'src/loans/entities/loan.entity'
import { InstallmentsService } from 'src/loans/modules/installments/installments.service'
import { Installment } from 'src/loans/modules/installments/entities/installment.entity'
import { UpdateInstallmentDto } from 'src/loans/modules/installments/dtos/update-installment.dto'
import {
  INSTALLMENT_STATES,
  INSTALLMENT_TYPES,
} from 'src/loans/modules/installments/constants/installments.c'
import { CreateInstallmentDto } from 'src/loans/modules/installments/dtos/create-installment.dto'

@Injectable()
export class JobInstallmentsService {
  private DATE_FORMAT = 'YYYY-MM-DD'
  private TODAY = parse(new Date().toISOString(), this.DATE_FORMAT)
  constructor(
    private installmentService: InstallmentsService,
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
    const { startsOn, deadline } = this.installmentService.generateInstallmentDates(
      loan,
      installment,
    )
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
      const newInstallmentNumber = loan.currentInstallmentNumber + 1
      await this.loanManagementService.rawUpdate(loan.id, {
        currentInstallmentNumber: newInstallmentNumber,
      })
    }
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
    const { startsOn, deadline } = this.installmentService.generateInstallmentDates(
      loan,
      installment,
    )

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
      })
    }
  }

  async runDailyInterest(today = this.TODAY) {
    const loans = await this.loanManagementService.getLoansByState(LOAN_STATES.IN_PROGRESS)

    for (const loan of loans) {
      if (loan.installmentTypeId === INSTALLMENT_TYPES.FIXED) {
        await this.processFixedLoans(loan, today)
      } else {
        await this.processFlexibleLoans(loan, today)
      }
    }
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
