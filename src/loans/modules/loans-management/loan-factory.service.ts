import { Injectable } from '@nestjs/common'
import { Loan } from '../../entities/loan.entity'
import { CreateLoanDto, UpdateLoanDto } from '../../dtos/loans.dto'
import { Customer } from 'src/customers/entities/customer.entity'
import { Employee } from 'src/employees/entities/employee.entity'
import { PaymentPeriod } from '../../entities/payment-period.entity'
import { LoanState } from '../../entities/loan-state.entity'
import { LOAN_STATES } from '../../shared/constants'
import { INSTALLMENT_STATES } from 'src/loans/constants/installments'
import { Installment } from 'src/loans/entities/installment.entity'
import { create } from 'domain'

@Injectable()
export class LoanFactoryService {
  constructor() {}
  createLoan(createLoanDto: CreateLoanDto, customer: Customer, employee: Employee): Loan {
    const loan = new Loan()

    Object.assign(loan, createLoanDto)

    loan.customer = customer
    loan.employee = employee

    loan.paymentPeriod = { id: createLoanDto.paymentPeriodId } as PaymentPeriod
    loan.loanState = { id: createLoanDto.loanStateId } as LoanState
    loan.debt = createLoanDto.amount

    if (!createLoanDto.paymentDay) createLoanDto.paymentDay = new Date().getDate()
    if (createLoanDto.loanStateId === LOAN_STATES.FINALIZED) {
      loan.debt = 0
      loan.installmentsPaid = 1
    }

    return loan
  }

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
    const newCurrentInterest = loan.currentInterest - interestPaid
    const currentInterest = newCurrentInterest < 0 ? 0 : newCurrentInterest
    const totalInterestPaid = loan.totalInterestPaid + interestPaid
    const commissionsPaid = loan.commissionsPaid + commission

    const data: UpdateLoanDto = {
      currentInterest,
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
