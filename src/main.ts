import { NestFactory, Reflector } from '@nestjs/core'
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common'
import { getBotToken } from 'nestjs-telegraf'
import * as cookieParser from 'cookie-parser'

import { AppModule } from './app.module'
import { registerHandlebarsHelpers } from './config'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Cors configuration
  const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || []
  const origins = allowedOrigins.map((origin) => origin.trim())

  app.enableCors({
    origin: origins,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })

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

  app.use(cookieParser())
  registerHandlebarsHelpers()

  // Only set up webhook callback in production with valid domain
  if (process.env.NODE_ENV === 'production' && process.env.APP_DOMAIN) {
    const bot = app.get(getBotToken())
    app.use(bot.webhookCallback(process.env.TELEGRAM_HOOK_PATH))
  }

  await app.listen(3000)
}
bootstrap()
