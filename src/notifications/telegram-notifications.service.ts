import { Injectable } from '@nestjs/common'
import { InjectBot } from 'nestjs-telegraf'
import { InstallmentsService } from 'src/loans/modules/installments/installments.service'
import { LoanManagementService } from 'src/loans/modules/loans-management/loans-management.service'
import { UsersService } from 'src/users/services/users.service'
import { currencyFormat } from 'src/utils/number-format'
import { Telegraf } from 'telegraf'
import { IsNull, Not } from 'typeorm'

@Injectable()
export class TelegramNotificationsService {
  constructor(
    @InjectBot() private readonly bot: Telegraf,
    private readonly loanManagementService: LoanManagementService,
    private readonly installmentService: InstallmentsService,
    private readonly userService: UsersService,
  ) {}

  async runNotifications() {
    const loans = await this.loanManagementService.getLoansInDefault({
      customer: true,
    })

    let message = `<strong>Créditos en mora</strong> \n\n`
    let rest = loans.length
    for (const loan of loans) {
      rest--
      const { daysLate } = loan
      const amountInArrears = await this.installmentService.getOverdueInterestAmount(loan.id)
      const pendingAmount = currencyFormat(amountInArrears)
      let item = `<strong>${loan.customer.name}</strong> \n Monto: ${pendingAmount} \n Días en mora: ${daysLate}`
      if (rest > 0) {
        item += `\n\n`
      }
      message += item
    }

    const authorizedUsers = await this.userService.findAll({ where: { chatId: Not(IsNull()) } })

    for (const authUser of authorizedUsers) {
      await this.bot.telegram.sendMessage(authUser.chatId, message, { parse_mode: 'HTML' })
    }

    console.log('Notificaciones enviadas!')
  }
}
