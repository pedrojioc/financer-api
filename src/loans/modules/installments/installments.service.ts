import { Between, DataSource, EntityManager, FindOptionsWhere, MoreThan, Repository } from 'typeorm'
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
	addDay,
	addMonth,
	diffDays,
	format,
	monthDays,
	monthEnd,
	monthStart,
	parse,
} from '@formkit/tempo'

import {
	INSTALLMENT_STATES,
	INSTALLMENT_TYPES,
} from 'src/loans/modules/installments/constants/installments.c'
import { CreateInstallmentDto } from 'src/loans/modules/installments/dtos/create-installment.dto'
import { UpdateInstallmentDto } from 'src/loans/modules/installments/dtos/update-installment.dto'
import { Installment } from 'src/loans/modules/installments/entities/installment.entity'
import { FilterPaginatorDto } from 'src/lib/filter-paginator/dtos/filter-paginator.dto'
import { FilterPaginator } from 'src/lib/filter-paginator'
import { InstallmentState } from 'src/loans/modules/installments/entities/installment-state.entity'
import { Loan } from 'src/loans/entities/loan.entity'
import { DeletedInstallment } from 'src/loans/modules/installments/entities/deleted-installment.entity'
import { FilterInstallmentsDto } from './dtos/filter-installments.dto'

@Injectable()
export class InstallmentsService {
	private DATE_FORMAT = 'YYYY-MM-DD'
	private today = format(new Date(), this.DATE_FORMAT)

	constructor(
		@InjectRepository(Installment) private repository: Repository<Installment>,
		@InjectRepository(DeletedInstallment)
		private readonly deletedRepo: Repository<DeletedInstallment>,
		private dataSource: DataSource,
	) {}

	async create(installmentDto: CreateInstallmentDto, manager?: EntityManager) {
		if (installmentDto.installmentTypeId === INSTALLMENT_TYPES.FIXED) {
			const loan = await this.dataSource.manager.findOneBy(Loan, { id: installmentDto.loanId })
			const { interest, amortization, total } = this.calculateFixedInstallment(
				loan.interestRate,
				loan.amount,
				loan.installmentsNumber,
				installmentDto.installmentNumber,
			)
			installmentDto.capital = amortization
			installmentDto.interest = interest
			installmentDto.total = total
		}
		if (manager) {
			const entity = manager.create(Installment, installmentDto)
			return manager.save(entity)
		}
		const entity = this.repository.create(installmentDto)
		return this.repository.save(entity)
	}

	findAll(where: FindOptionsWhere<Installment> = {}) {
		return this.repository.find({
			where,
		})
	}

	update(id: number, installmentDto: UpdateInstallmentDto) {
		return this.repository.update(id, installmentDto)
	}

	async delete(id: number, userId: number) {
		const installment = await this.findOne(id)
		if (installment.installmentStateId === INSTALLMENT_STATES.PAID)
			throw new Error('Cannot delete a paid installment')

		console.log({ ...installment })
		await this.deletedRepo.insert({ ...installment, userId, installmentId: installment.id })

		return await this.repository.delete(id)
	}

	async findOne(id: number) {
		const installment = await this.repository.findOneBy({ id })
		if (!installment) throw new NotFoundException()
		return installment
	}

	findAllByLoan(params: FilterInstallmentsDto) {
		const whereOptions: FindOptionsWhere<Installment> = {}

		if (params.loanId) {
			whereOptions.loanId = params.loanId
		}

		if (params.state) {
			whereOptions.installmentStateId = params.state
		}

		const paginator = new FilterPaginator(this.repository, {
			where: whereOptions,
			relations: ['installmentState'],
		})
		const result = paginator.paginate(params.page).execute()
		return result
	}

	async bulkUpdate(
		installmentIds: number[],
		updateInstallmentDto: UpdateInstallmentDto,
		manager?: EntityManager,
	) {
		const queryBuilder = manager ? manager : this.repository
		await queryBuilder
			.createQueryBuilder()
			.update(Installment)
			.set(updateInstallmentDto)
			.whereInIds(installmentIds)
			.execute()
	}

	async transactionalCreate(manager: EntityManager, installmentDto: CreateInstallmentDto) {
		const installment = manager.create(Installment, installmentDto)
		return await manager.save(installment)
	}

	async getCurrentInstallment(loanId: number, date: Date) {
		const installment = await this.repository
			.createQueryBuilder('installment')
			.where(
				'loan_id = :loanId AND installment_state_id = :installmentStateId AND payment_deadline >= :currentDate',
				{
					loanId,
					installmentStateId: INSTALLMENT_STATES.IN_PROGRESS,
					currentDate: date,
				},
			)
			.getOne()

		return installment
	}

	async getLastInstallment(loanId: number) {
		const installment = await this.repository
			.createQueryBuilder('installment')
			.where('loan_id = :loanId', { loanId })
			.orderBy('payment_deadline', 'DESC')
			.getOne()

		return installment
	}

	async calculateDaysLate(loanId: number, manager: EntityManager) {
		const installment = await this.findOldestInstallment(manager, loanId)

		if (!installment) return 0

		const today = this.today
		const deadline = format(installment.paymentDeadline, this.DATE_FORMAT)
		const daysLate = diffDays(today, deadline)

		return daysLate
	}

	findUnpaidInstallments(
		loanId: number,
		installmentId?: number,
		omitCurrentInstallment: boolean = true,
	) {
		const query = this.repository
			.createQueryBuilder()
			.where('loan_id = :loanId', { loanId })
			.andWhere('installment_state_id <> :state', {
				state: INSTALLMENT_STATES.PAID,
			})

		if (omitCurrentInstallment)
			query.andWhere(':today >= payment_deadline', {
				today: this.today,
			})

		if (installmentId) query.andWhere('id <> :installmentId', { installmentId })

		return query.getMany()
	}

	async getOverdueInterestAmount(loanId: number) {
		const { amount } = await this.repository
			.createQueryBuilder()
			.select('SUM(interest)', 'amount')
			.where('loan_id = :loanId', { loanId })
			.andWhere('installment_state_id = :state', {
				state: INSTALLMENT_STATES.OVERDUE,
			})
			.getRawOne()

		return amount || 0
	}
	async getPendingInterestAmount(loanId: number, includeCurrentInstallment: boolean = false) {
		const query = this.repository
			.createQueryBuilder()
			.select('SUM(interest)', 'amount')
			.where('loan_id = :loanId', { loanId })

		if (includeCurrentInstallment) {
			query.andWhere(
				'(installment_state_id = :stateOverdue OR installment_state_id = :stateAwaitingPayment OR installment_state_id = :stateInProgress)',
				{
					stateInProgress: INSTALLMENT_STATES.IN_PROGRESS,
					stateAwaitingPayment: INSTALLMENT_STATES.AWAITING_PAYMENT,
					stateOverdue: INSTALLMENT_STATES.OVERDUE,
				},
			)
		} else {
			query.andWhere(
				'(installment_state_id = :stateOverdue OR installment_state_id = :stateAwaitingPayment)',
				{
					stateOverdue: INSTALLMENT_STATES.OVERDUE,
					stateAwaitingPayment: INSTALLMENT_STATES.AWAITING_PAYMENT,
				},
			)
		}

		const { amount } = await query.getRawOne()

		return Number(amount) || 0
	}

	async makePayment(
		manager: EntityManager,
		installmentId: number,
		updateInstallmentDto: UpdateInstallmentDto,
	) {
		await manager.update(Installment, { id: installmentId }, updateInstallmentDto)
		const i = await manager.findOneBy(Installment, { id: installmentId })

		return i
	}

	getStates() {
		return this.dataSource.manager.find(InstallmentState)
	}

	countInstallments(loanId: number) {
		return this.repository.countBy({ loanId, interest: MoreThan(0) })
	}

	generateInstallmentDates(
		loan: Loan,
		prevInstallment: Installment | null,
	): { startsOn: Date; deadline: Date } {
		let startsOn: Date
		let deadline: Date

		if (!prevInstallment) {
			const startDay = loan.startAt.getDate()
			startsOn = addDay(loan.startAt, 1)
			if (loan.paymentDay > startDay) {
				// ? La fecha de pago es en el mismo mes que inicio el crédito
				deadline = loan.startAt
			} else {
				deadline = addMonth(loan.startAt, 1)
			}
		} else {
			startsOn = addDay(prevInstallment.paymentDeadline, 1)
			deadline = addMonth(prevInstallment.paymentDeadline, 1)
		}

		const isOverflow = monthDays(deadline) < loan.paymentDay
		if (isOverflow) {
			deadline = monthEnd(deadline)
		} else {
			deadline.setDate(loan.paymentDay)
		}

		return { startsOn, deadline }
	}

	/**
	 * Calculates the fixed installment amount for a loan.
	 * @param iRate The interest rate of the loan.
	 * @param amount The amount of the loan.
	 * @param installmentsNumber The total number of installments for the loan.
	 * @param installmentNumber The number of the installment to calculate.
	 * @returns An object containing the interest, amortization, and total amount for the installment.
	 */
	calculateFixedInstallment(
		iRate: number,
		amount: number,
		installmentsNumber: number,
		installmentNumber: number,
	) {
		const interestRate = iRate / 100
		const installmentAmount =
			(amount * interestRate) / (1 - Math.pow(1 + interestRate, -installmentsNumber))
		const prevBalance =
			amount * Math.pow(1 + interestRate, installmentNumber - 1) -
			installmentAmount * ((Math.pow(1 + interestRate, installmentNumber - 1) - 1) / interestRate)

		const interest = prevBalance * interestRate
		const amortization = installmentAmount - interest
		const total = interest + amortization

		return {
			interest,
			amortization,
			total,
		}
	}

	findFirstInstallment(loanId: number) {
		return this.repository.findOne({
			where: { loanId },
			order: { id: 'asc' },
		})
	}

	async getInstallmentsByMonth(date: string) {
		const d = parse(date)
		const startDate = monthStart(d)
		const endDate = monthEnd(d)

		const result = await this.repository.find({
			where: {
				paymentDeadline: Between(startDate, endDate),
			},
			relations: { loan: { customer: true } },
		})

		const installments = result.reduce((acc, installment) => {
			const key = format(installment.paymentDeadline, 'YYYY-MM-DD')
			acc[key] = acc[key] || []
			acc[key].push(installment)
			return acc
		}, {})

		return installments
	}

	/*
	 ** Privates Methods
	 */
	private async findOldestInstallment(manager: EntityManager, loanId: number) {
		const installment = await manager.findOne(Installment, {
			where: { loanId, installmentStateId: INSTALLMENT_STATES.OVERDUE },
			order: { paymentDeadline: 'ASC' },
		})

		return installment
	}
}
