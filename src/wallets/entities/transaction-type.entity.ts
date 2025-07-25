import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'transaction_types' })
export class TransactionType {
	@PrimaryGeneratedColumn()
	id: number

	@Column({ name: 'name', nullable: false })
	name: string

	@Column({ name: 'description', nullable: true })
	description: string

	@Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	createdAt: Date

	@Column({
		name: 'updated_at',
		type: 'timestamp',
		default: () => 'CURRENT_TIMESTAMP',
		onUpdate: 'CURRENT_TIMESTAMP',
	})
	updatedAt: Date
}
