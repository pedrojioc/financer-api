import { NestFactory } from '@nestjs/core'
import { JobLoanSnapshotsService } from './job-loan-snapshots.service'
import { JobLoanSnapshotsModule } from './job-loan-snapshots.module'

async function bootstrap() {
	try {
		const app = await NestFactory.createApplicationContext(JobLoanSnapshotsModule)
		const interestService = app.get(JobLoanSnapshotsService)

		console.log('Running monthly loan snapshots job...')
		await interestService.runLoanSnapshots()
		console.log('Monthly loan snapshots job completed successfully')
		await app.close()
	} catch (error) {
		console.error('Error running monthly loan snapshots job:', error)
		process.exit(1)
	}
}

bootstrap()
