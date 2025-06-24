import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          type: 'mysql',
          host: config.get('DATABASE_HOST'),
          port: +config.get<number>('DATABASE_PORT'),
          username: config.get('DATABASE_USERNAME'),
          password: config.get('DATABASE_PASSWORD'),
          database: config.get('DATABASE_NAME'),
          entities: [__dirname + '/../**/*.entity.{ts,js}'],
          synchronize: false,
          autoLoadEntities: true,
          logging: false,
          extra: { connectionLimit: 10 },
        }
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
