import { NestFactory } from '@nestjs/core'
import { AppModule } from 'src/app.module'
import { TasksModule } from 'src/tasks/tasks.module'
import { ManualTasksService } from 'src/tasks/services/manual-tasks.service'

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule)
  const taskService = app.select(TasksModule).get(ManualTasksService, { strict: true })
  await taskService.setPaymentIdOnCommissions()
  await app.close()
}

bootstrap()
