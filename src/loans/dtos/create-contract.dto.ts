export interface CreateContractDto {
  loanId: number
  today: string
  amount: string
  amountInWords: string
  months: string
  startsOn: string
  legalInterestRate: number
  customer: string
  customerId: string
  installmentsNumber: number
  legalInstallment: number
  firstInstallmentDeadline: string
  lastInstallmentDeadline: string
}
