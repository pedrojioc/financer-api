import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { PaymentPeriod } from '../modules/payments/entities/payment-period.entity'

@Injectable()
export class PaymentPeriodsService {
  constructor(@InjectRepository(PaymentPeriod) private repository: Repository<PaymentPeriod>) {}

  findAll() {
    return this.repository.find()
  }
}
