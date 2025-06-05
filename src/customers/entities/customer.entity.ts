import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { FinancialActivity } from './financial-activity.entity'
import { Gender } from 'src/genders/entities/gender.entity'

@Entity({ name: 'customers' })
export class Customer {
  @PrimaryGeneratedColumn()
  id: number

  @Generated('uuid')
  uuid: string

  @ManyToOne(() => Gender, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'gender_id' })
  gender: Gender

  @Column({ name: 'gender_id' })
  genderId: number

  @ManyToOne(() => FinancialActivity, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'financial_activity_id' })
  financialActivity: FinancialActivity

  @Column({ type: 'varchar', length: 100 })
  name: string

  @Column({ type: 'varchar', length: 20, name: 'id_number' })
  idNumber: string

  @Column({ type: 'varchar', length: 50 })
  address: string

  @Column({ type: 'varchar', length: 50, name: 'phone_number' })
  phoneNumber: string

  @Column({ type: 'date', nullable: true })
  birthdate: Date

  @Column({ name: 'personal_reference', type: 'varchar', nullable: true })
  personalReference: string

  @Column({ name: 'personal_reference_phone', type: 'varchar', nullable: true })
  personalReferencePhone: string

  @Column({ name: 'work_reference', type: 'varchar', nullable: true })
  workReference: string

  @Column({ name: 'work_reference_phone', type: 'varchar', nullable: true })
  workReferencePhone: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
