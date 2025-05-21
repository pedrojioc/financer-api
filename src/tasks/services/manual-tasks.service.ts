import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Commission } from 'src/employees/entities/commission.entity'
import { Installment } from 'src/loans/entities/installment.entity'
import { Payment } from 'src/loans/entities/payments.entity'
import { DataSource, In, Repository } from 'typeorm'

@Injectable()
export class ManualTasksService {
  constructor(
    @InjectRepository(Payment) private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Commission) private readonly commissionRepo: Repository<Commission>,
    private readonly dataSource: DataSource,
  ) {}

  async setLoanIdOnPayments() {
    const payments = await this.paymentRepo.find()
    for (const payment of payments) {
      /*
      const installment = await this.installmentService.findOne(payment.installmentId)
      await this.paymentRepo.update(payment.id, {
        loanId: installment.loanId,
      })
      */
    }

    console.log('Payments updated successfully')
  }

  async setPaymentIdOnCommissions() {
    const commissions = await this.commissionRepo.find()

    for (const commission of commissions) {
      if (!commission.installmentId) continue

      const installment = await this.dataSource
        .getRepository(Installment)
        .createQueryBuilder('installment')
        .leftJoinAndSelect('installment.payments', 'payment')
        .where('installment_id = :id', { id: commission.installmentId })
        .getOne()

      await this.commissionRepo.update(commission.id, {
        paymentId: installment?.payments[0]?.id,
      })
      console.log('Commission updated successfully', commission.id)
    }
    console.log('Commissions updated successfully')
  }
}
