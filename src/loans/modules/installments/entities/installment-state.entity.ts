import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'installment_states' })
export class InstallmentState {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', length: 100 })
  name: string
}
