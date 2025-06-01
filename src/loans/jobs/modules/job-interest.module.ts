import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule } from '@nestjs/config'
import * as dotenv from 'dotenv'

import { Interest } from 'src/loans/entities/interest.entity'
import { JobInterestsService } from 'src/loans/services/jobs/job-interests.service'
import { InstallmentsModule } from 'src/loans/modules/installments/installments.module'
import { DailyInterestModule } from 'src/loans/modules/daily-interest/daily-interest.module'
import { LoansManagementModule } from 'src/loans/modules/loans-management/loans-management.module'

// Load environment variables directly
dotenv.config()

// Set entity paths based on environment
let entitiesPath = 'src/**/*.entity.ts'
if (process.env.NODE_ENV === 'production') {
  entitiesPath = 'dist/src/**/*.entity.js'
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT, 10),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [entitiesPath],
      synchronize: false,
    }),
    TypeOrmModule.forFeature([Interest]),
    InstallmentsModule,
    DailyInterestModule,
    LoansManagementModule,
  ],
  providers: [JobInterestsService],
  exports: [JobInterestsService],
})
export class JobInterestModule {}

