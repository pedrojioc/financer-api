import { Injectable } from '@nestjs/common'
import { HttpService } from '@nestjs/axios'
import { ConfigService } from '@nestjs/config'
import { firstValueFrom, map } from 'rxjs'
import { WhatsAppForDelayDto } from './dtos/whatsapp-for-delay.dto'
import { LoanManagementService } from 'src/loans/modules/loans-management/loans-management.service'

import { diffDays, isAfter } from '@formkit/tempo'
import { Loan } from 'src/loans/entities/loan.entity'
import { InstallmentsService } from 'src/loans/modules/installments/installments.service'
import { currencyFormat } from 'src/utils/number-format'

@Injectable()
export class WhatsAppService {
  SUPPORT_NUMBER: string
  SUPERVISOR_NUMBER: string
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly loanManagementService: LoanManagementService,
    private readonly installmentsService: InstallmentsService,
  ) {
    this.SUPPORT_NUMBER = this.configService.get('SUPPORT_NUMBER')
    this.SUPERVISOR_NUMBER = this.configService.get('SUPERVISOR_NUMBER')
  }

  async sendMessage(messageData: WhatsAppForDelayDto) {
    const unitTimes = messageData.days_late > 1 ? 'días' : 'día'
    const body = JSON.stringify({
      messaging_product: 'whatsapp',
      to: `57${messageData.to}`,
      type: 'template',
      template: {
        name: 'pago_atrasado',
        language: {
          code: 'es',
        },
        components: [
          { type: 'header', parameters: [{ type: 'text', parameter_name: 'icon', text: '📢' }] },
          {
            type: 'body',
            parameters: [
              { type: 'text', parameter_name: 'name', text: messageData.name },
              { type: 'text', parameter_name: 'days_late', text: messageData.days_late },
              { type: 'text', parameter_name: 'unit_time', text: unitTimes },
              { type: 'text', parameter_name: 'pending_amount', text: messageData.pending_amount },
              // { type: 'text', parameter_name: 'contact_number', text: this.SUPPORT_NUMBER },
            ],
          },
        ],
      },
    })

    const wToken = this.configService.get('WHATSAPP_TOKEN')
    const wEndpoint = this.configService.get('WHATSAPP_ENDPOINT')

    const config = {
      headers: {
        Authorization: `Bearer ${wToken}`,
        'Content-Type': 'application/json',
      },
    }

    try {
      const response = await firstValueFrom(this.httpService.post(wEndpoint, body, config))
      return response.data
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  private isNotificationsDisabled(loan: Loan, today: Date) {
    const INTERVAL = 5
    const daysSinceLastNot = diffDays(today, loan.lastNotificationSent)

    if (loan.isNotificationsPaused) return true
    if (daysSinceLastNot < INTERVAL && loan.lastNotificationSent !== null) return true
    if (loan.pauseNotificationsUntil !== null && isAfter(loan.pauseNotificationsUntil, today)) {
      return true
    }

    return false
  }

  async runNotifications() {
    const today = new Date()
    const loans = await this.loanManagementService.getLoansInDefault(['customer'])
    const response = []
    for (const loan of loans) {
      const { daysLate } = loan

      if (this.isNotificationsDisabled(loan, today)) continue

      const amountInArrears = await this.installmentsService.getOverdueInterestAmount(loan.id)
      const pendingAmount = currencyFormat(amountInArrears)

      const data: WhatsAppForDelayDto = {
        name: loan.customer.name,
        days_late: daysLate,
        pending_amount: pendingAmount,
        to: loan.customer.phoneNumber,
      }

      const result = await this.sendMessage(data)
      await this.loanManagementService.rawUpdate(loan.id, {
        lastNotificationSent: today,
      })

      response.push(result)
    }

    return response
  }
}
