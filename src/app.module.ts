import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { LoansModule } from './loans/loans.module'
import { EmployeesModule } from './employees/employees.module'
import { environments } from './environments'
import { DatabaseModule } from './database/database.module'
import { RolesModule } from './roles/roles.module'
import { UsersModule } from './users/users.module'
import { CustomersModule } from './customers/customers.module'
import { AuthModule } from './auth/auth.module'
import { MenuModule } from './menu/menu.module'
import { PaymentMethodsModule } from './payment-methods/payment-methods.module'
import { NotificationsModule } from './notifications/notifications.module'
import { TelegramBotModule } from './telegram-bot/telegram-bot.module'
import { ReportsModule } from './reports/reports.module'
import { TasksModule } from './tasks/tasks.module'
import { PdfModule } from './pdf/pdf.module'
import { GendersModule } from './genders/genders.module'
import { FinancialAccountingModule } from './financial-accounting/financial-accounting.module'
import { LoanReportsModule } from './loan-reports/loan-reports.module'
import config from './config'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: environments[process.env.NODE_ENV] || '.env',
      load: [config],
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    LoansModule,
    EmployeesModule,
    RolesModule,
    UsersModule,
    CustomersModule,
    MenuModule,
    PaymentMethodsModule,
    TelegramBotModule,
    NotificationsModule,
    ReportsModule,
    LoanReportsModule,
    TasksModule,
    PdfModule,
    GendersModule,
    FinancialAccountingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
