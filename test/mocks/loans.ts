import { Loan } from 'src/loans/entities/loan.entity'
import { mockCustomer } from './customers'
import { mockEmployee } from './employees'
import { PaymentPeriod } from 'src/loans/modules/payments/entities/payment-period.entity'
import { LoanState } from 'src/loans/entities/loan-state.entity'
import { InstallmentType } from 'src/loans/modules/installments/entities/installment-type.entity'

const loanStateInProgress = new LoanState()
loanStateInProgress.id = 1
loanStateInProgress.name = 'En curso'
loanStateInProgress.createdAt = new Date()
loanStateInProgress.updatedAt = new Date()

export const mockLoan: Loan = {
  id: 1,
  customer: mockCustomer,
  customerId: mockCustomer.id,
  employee: mockEmployee,
  employeeId: mockEmployee.id,
  paymentPeriod: new PaymentPeriod(),
  loanState: loanStateInProgress,
  loanStateId: loanStateInProgress.id,
  amount: 2000000,
  interestRate: 10,
  debt: 2000000,
  installmentsNumber: 6,
  installmentsPaid: 0,
  daysLate: 0,
  currentInterest: 0,
  totalInterestPaid: 0,
  commissionsPaid: 0,
  startAt: new Date('2024-07-01'),
  endAt: new Date('2025-01-01'),
  paymentDay: 1,
  lastInterestPayment: undefined,
  createdAt: new Date(),
  updatedAt: new Date(),
  paymentPeriodId: 1,
  isNotificationsPaused: true,
  pauseNotificationsUntil: null,
  lastNotificationSent: null,
  installmentType: new InstallmentType(),
  installmentTypeId: 1,
  currentInstallmentNumber: 0,
  commissionRate: 0,
  parentLoan: null,
  parentLoanId: null,
  payments: [],
  refinancing: [],
}

const mockLoans = new Array(10).map((i) => ({ ...mockLoan, id: i + 1 }))
