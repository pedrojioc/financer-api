import { addMonth, monthEnd, monthStart } from '@formkit/tempo'
import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { INSTALLMENT_STATES } from 'src/loans/modules/installments/constants/installments.c'
import { LOAN_STATES } from 'src/loans/shared/constants'

@Injectable()
export class ReportsService {
  constructor(private readonly dataSource: DataSource) {}

  async profitHistory() {
    // Get the previous month's date
    const startDate = monthEnd(addMonth(new Date(), -1))

    // Calculate the date exactly 12 months before the start date
    const twelveMonthsAgo = monthStart(addMonth(startDate, -12))

    const installments = await this.dataSource
      .createQueryBuilder()
      .select(`DATE_FORMAT(i.payment_deadline, '%Y-%m') AS month, SUM(i.interest) AS total`)
      .from('installments', 'i')
      .where('i.payment_deadline >= :twelveMonthsAgo', { twelveMonthsAgo })
      .andWhere('i.payment_deadline <= :startDate', { startDate })
      .andWhere('i.installment_state_id = :installmentStateId', {
        installmentStateId: INSTALLMENT_STATES.PAID,
      })
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany()

    return installments
  }

  async getMonthProfit(date: string) {
    const startDate = monthStart(date)
    const endDate = monthEnd(date)

    const { total: receivedAmount } = await this.dataSource
      .createQueryBuilder()
      .select(`SUM(p.interest) AS total`)
      .from('payments', 'p')
      .where('p.date >= :startDate', { startDate })
      .andWhere('p.date <= :endDate', { endDate })
      .getRawOne()

    const history = [] // await this.getPaymentHistory()
    const expectedAmount = await this.getExpectedAmount()

    return { expectedAmount, receivedAmount, history }
  }

  private async getExpectedAmount() {
    const loans = await this.dataSource
      .createQueryBuilder()
      .select(`l.amount, l.interest_rate, l.debt`)
      .from('loans', 'l')
      .where('l.loan_state_id = :loanStateId', {
        loanStateId: LOAN_STATES.IN_PROGRESS,
      })
      .getRawMany()

    let total = 0
    for (const loan of loans) {
      const interestRate = loan.interest_rate / 100
      const interest = loan.debt * interestRate
      total += interest
    }

    return total
  }

  private getPaymentHistory() {
    const to = monthEnd(addMonth(new Date(), -1))
    const from = monthStart(addMonth(to, -12))

    return this.dataSource
      .createQueryBuilder()
      .select(`DATE_FORMAT(p.date, '%Y-%m') AS month, SUM(p.interest) AS total`)
      .from('payments', 'p')
      .where('p.date >= :from', { from })
      .andWhere('p.date <= :to', { to })
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany()
  }
}
