import { Module } from '@nestjs/common'
import { WhatsAppService } from './whatsapp.service'
import { NotificationsController } from './notifications.controller'
import { HttpModule } from '@nestjs/axios'
import { LoansManagementModule } from 'src/loans/modules/loans-management/loans-management.module'
import { InstallmentsModule } from 'src/loans/modules/installments/installments.module'
import { TelegramNotificationsService } from './telegram-notifications.service'
import { UsersModule } from 'src/users/users.module'

@Module({
  imports: [HttpModule, LoansManagementModule, InstallmentsModule, UsersModule],
  providers: [WhatsAppService, TelegramNotificationsService],
  controllers: [NotificationsController],
})
export class NotificationsModule {}
