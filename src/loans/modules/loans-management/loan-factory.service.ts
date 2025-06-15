import { Injectable } from '@nestjs/common'
import { Loan } from '../../entities/loan.entity'
import { CreateLoanDto, UpdateLoanDto } from '../../dtos/loans.dto'
import { LOAN_STATES } from '../../shared/constants'

@Injectable()
export class LoanFactoryService {
  constructor() {}

  generateLoanObject(loanDto: CreateLoanDto) {
    let loanObject = loanDto
    if (!loanObject.paymentDay) loanObject.paymentDay = new Date().getDate()
    if (loanObject.loanStateId === LOAN_STATES.FINALIZED) {
      loanObject.debt = 0
    }
    loanObject.debt = loanDto.amount
    return loanObject
  }

  /**
   * @param loan
   * @param interestPaid
   * @param capital
   * @param daysLate
   * @param commission
   * @param countAsPaid indicates if the payment(installment) should be counted as paid
   * @returns
   * @description
   * This function calculates the new values of a loan after a payment is made.
   */
  valuesAfterPayment(
    loan: Loan,
    interestPaid: number,
    capital: number,
    daysLate: number,
    commission: number,
    installmentsPaid: number,
  ) {
    const totalInterestPaid = loan.totalInterestPaid + interestPaid
    const commissionsPaid = loan.commissionsPaid + commission

    const data: UpdateLoanDto = {
      totalInterestPaid,
      daysLate,
      commissionsPaid,
    }

    data.installmentsPaid = Number(loan.installmentsPaid) + installmentsPaid

    if (capital > 0) {
      data.debt = Number(loan.debt) - capital
    }
    if (data.debt === 0) data.loanStateId = LOAN_STATES.FINALIZED
    return data
  }
}
