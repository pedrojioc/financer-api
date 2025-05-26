export const LOAN_STATES = {
  PENDING: 1,
  IN_PROGRESS: 2,
  FINALIZED: 3,
  REJECTED: 4,
  REFINANCED: 5,
}

export const PAYMENT_PERIODS = {
  WEEKLY: 1,
  FORTNIGHTLY: 2,
  MONTHLY: 3,
}

export const INSTALLMENT_TYPES = {
  FIXED: 1,
  FLEXIBLE: 2,
}

type Keys = keyof typeof LOAN_STATES

export type LoanStateValueTypes = (typeof LOAN_STATES)[Keys]
