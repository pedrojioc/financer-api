import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { BotUpdate } from './bot-update'
import { TelegrafModule } from 'nestjs-telegraf'
import { UsersModule } from 'src/users/users.module'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { LoansManagementModule } from 'src/loans/modules/loans-management/loans-management.module'
import { InstallmentsModule } from 'src/loans/modules/installments/installments.module'

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const telegramToken = configService.get('TELEGRAM_BOT_TOKEN')
        const appDomain = configService.get('APP_DOMAIN')
        const isProduction = process.env.NODE_ENV === 'production'

        // Skip bot configuration if no token is provided
        if (!telegramToken) {
          console.warn('TELEGRAM_BOT_TOKEN not configured, skipping Telegram bot setup')
          return null
        }

        // Use webhook only in production with a valid domain
        if (isProduction && appDomain) {
          return {
            token: telegramToken,
            launchOptions: {
              webhook: {
                domain: appDomain,
                path: configService.get('TELEGRAM_HOOK_PATH'),
              },
            },
          }
        }

        // Use polling for development or when no domain is configured
        return {
          token: telegramToken,
          launchOptions: {
            polling: {
              timeout: 30,
              limit: 100,
            },
          },
        }
      },
      inject: [ConfigService],
    }),
    UsersModule,
    LoansManagementModule,
    InstallmentsModule,
  ],
  providers: [AuthService, BotUpdate],
  exports: [TelegrafModule],
})
export class TelegramBotModule {}
