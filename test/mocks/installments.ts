import { parse } from '@formkit/tempo'
import { INSTALLMENT_STATES } from 'src/loans/modules/installments/constants/installments.c'
import { InstallmentState } from 'src/loans/modules/installments/entities/installment-state.entity'
import { Installment } from 'src/loans/modules/installments/entities/installment.entity'
import { Loan } from 'src/loans/entities/loan.entity'
import { PaymentMethod } from 'src/payment-methods/entities/payment-method.entity'

const loan = new Loan()
loan.id = 1
const paymentMethod = new PaymentMethod()
paymentMethod.id = 1

const installmentState = new InstallmentState()
installmentState.id = INSTALLMENT_STATES.IN_PROGRESS

export const mockInstallment: Installment = {
  id: 1,
  loan: loan,
  loanId: loan.id,
  installmentState,
  installmentStateId: installmentState.id,
  debt: 2000000,
  startsOn: parse('2024-09-01'),
  paymentDeadline: parse('2024-09-30'),
  days: 30,
  installmentNumber: 1,
  capital: 0,
  interest: 200000,
  interestPaid: 0,
  total: 0,
  paymentDate: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  dailyInterest: [],
  payments: [],
  commissionsInstallments: [],
  isProrate: false,
}
