import { NestFactory, Reflector } from '@nestjs/core'
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common'
import { getBotToken } from 'nestjs-telegraf'
import * as cookieParser from 'cookie-parser'

import { AppModule } from './app.module'
import { registerHandlebarsHelpers } from './config'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: false,
      },
    }),
  )
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector))) // Activate serializer

  // Cors configuration
  const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || []
  const origins = allowedOrigins.map((origin) => origin.trim())

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || origins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`))
      }
    },
    credentials: true,
  })

  app.use(cookieParser())
  registerHandlebarsHelpers()

  const bot = app.get(getBotToken())
  app.use(bot.webhookCallback(process.env.TELEGRAM_HOOK_PATH))

  await app.listen(3000)
}
bootstrap()
