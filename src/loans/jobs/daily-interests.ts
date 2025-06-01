import { NestFactory } from '@nestjs/core'
import { JobInterestsService } from '../services/jobs/job-interests.service'
import { JobInterestModule } from './modules/job-interest.module'

async function bootstrap() {
  try {
    const app = await NestFactory.createApplicationContext(JobInterestModule)
    const interestService = app.get(JobInterestsService)

    console.log('Running daily interest job...')
    await interestService.runDailyInterest()
    console.log('Daily interest job completed successfully')
    await app.close()
  } catch (error) {
    console.error('Error running daily interest job:', error)
    process.exit(1)
  }
}

bootstrap()
