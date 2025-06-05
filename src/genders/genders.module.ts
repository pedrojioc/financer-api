import { Module } from '@nestjs/common'
import { GendersController } from './genders.controller'
import { GendersService } from './genders.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Gender } from './entities/gender.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Gender])],
  controllers: [GendersController],
  providers: [GendersService],
})
export class GendersModule {}
