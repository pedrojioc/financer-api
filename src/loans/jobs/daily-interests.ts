import { NestFactory } from '@nestjs/core'
import { AppModule } from 'src/app.module'
import { JobInterestsService } from '../services/jobs/job-interests.service'
import { LoansModule } from '../loans.module'

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule)
  const interestService = app.select(LoansModule).get(JobInterestsService, { strict: true })

  await interestService.runDailyInterest()
  await app.close()
}

bootstrap()
