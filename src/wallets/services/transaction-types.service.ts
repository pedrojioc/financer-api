import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { TransactionType } from '../entities/transaction-type.entity'
import { Repository } from 'typeorm'

@Injectable()
export class TransactionTypesService {
  constructor(
    @InjectRepository(TransactionType)
    private readonly transactionTypeRepository: Repository<TransactionType>,
  ) {}

  findAll() {
    return this.transactionTypeRepository.find()
  }

  findOne(id: number) {
    return this.transactionTypeRepository.findOne({ where: { id } })
  }
}
