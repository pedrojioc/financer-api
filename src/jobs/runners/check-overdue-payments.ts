import { NestFactory } from '@nestjs/core'
import { JobOverduePaymentsService } from '../job-overdue-payments/job-overdue-payments.service'
import { JobOverduePaymentsModule } from '../job-overdue-payments/job-overdue-payments.module'

async function bootstrap() {
  try {
    const app = await NestFactory.createApplicationContext(JobOverduePaymentsModule)
    const interestService = app.get(JobOverduePaymentsService)

    console.log('Running daily overdue payments job...')
    await interestService.checkOverduePayments()
    console.log('Daily overdue payments job completed successfully')
    await app.close()
  } catch (error) {
    console.error('Error running daily overdue payments job:', error)
    process.exit(1)
  }
}

bootstrap()
