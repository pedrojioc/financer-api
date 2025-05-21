import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Commission } from './commission.entity'
import { Installment } from 'src/loans/entities/installment.entity'

@Entity({ name: 'commissions_installments' })
export class CommissionInstallment {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => Commission, (commission) => commission.commissionsInstallments, {
    cascade: true,
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'commission_id' })
  commission: Commission
  @Column({ name: 'commission_id', nullable: false })
  commissionId: number

  @ManyToOne(() => Installment, (installment) => installment.commissionsInstallments, {
    cascade: true,
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'installment_id' })
  installment: Installment
  @Column({ name: 'installment_id', nullable: false })
  installmentId: number

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number
}
