import { Injectable } from '@nestjs/common'
import { diffDays, parse } from '@formkit/tempo'

import { InstallmentsService } from 'src/loans/modules/installments/installments.service'
import { LoanManagementService } from 'src/loans/modules/loans-management/loans-management.service'

import { INSTALLMENT_STATES } from 'src/loans/modules/installments/constants/installments.c'
import { LOAN_STATES } from 'src/loans/shared/constants'

@Injectable()
export class JobOverduePaymentsService {
  private DATE_FORMAT = 'YYYY-MM-DD'
  private TODAY = parse(new Date().toISOString(), this.DATE_FORMAT)
  constructor(
    private installmentService: InstallmentsService,
    private loanManagementService: LoanManagementService,
  ) {}

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

  calculateDaysLate(deadline: Date, today: Date) {
    return diffDays(today, deadline)
  }
}
