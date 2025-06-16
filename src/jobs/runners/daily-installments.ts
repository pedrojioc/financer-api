import { NestFactory } from '@nestjs/core'
import { JobInstallmentsService } from '../job-installments/job-installments.service'
import { JobInstallmentsModule } from '../job-installments/job-installments.module'

async function bootstrap() {
  try {
    const app = await NestFactory.createApplicationContext(JobInstallmentsModule)
    const interestService = app.get(JobInstallmentsService)

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
