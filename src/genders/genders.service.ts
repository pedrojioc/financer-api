import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Gender } from './entities/gender.entity'
import { Repository } from 'typeorm'

@Injectable()
export class GendersService {
  constructor(@InjectRepository(Gender) private readonly repository: Repository<Gender>) {}

  findAll() {
    return this.repository.find()
  }
}
