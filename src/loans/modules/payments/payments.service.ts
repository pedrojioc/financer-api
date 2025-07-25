import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnprocessableEntityException,
} from '@nestjs/common'

import { InstallmentsService } from '../installments/installments.service'
import { LoanManagementService } from '../loans-management/loans-management.service'
import { AddPaymentDto } from './dtos/add-payment.dto'

import { InstallmentFactoryService } from '../installments/installment-factory.service'
import { Loan } from 'src/loans/entities/loan.entity'
import { INSTALLMENT_STATES } from 'src/loans/modules/installments/constants/installments.c'
import { CommissionsService } from 'src/employees/services/commissions.service'
import { Transactional } from 'src/shared/transactional/transactional.decorator'
import { DataSource, EntityManager, In } from 'typeorm'
import { EmployeesService } from 'src/employees/services/employees.service'
import { Payment } from 'src/loans/modules/payments/entities/payments.entity'
import { CreatePaymentDto } from './dtos/create-payment.dto'
import { NewCapitalPaymentDto } from './dtos/new-capital-payment.dto'
import { FilterPaymentsDto } from './dtos/filter-payments.dto'
import { MarkPaymentAsReceived } from './dtos/bulk-received.dto'
import { CreateCommissionDto } from 'src/employees/dtos/create-commission.dto'
import { PAYMENT_TYPES } from './constants/payments.c'
import { GetLoanPaymentsDto } from './dtos/get-loan-payments.dto'
import { WALLET_TYPES } from 'src/wallets/constants/wallet-constants'
import {
  TRANSACTION_CATEGORIES,
  TRANSACTION_TYPES,
} from 'src/wallets/constants/transaction-constants'
import { TransactionsService } from 'src/wallets/services/transactions.service'

@Injectable()
export class PaymentsService {
  constructor(
    private loanManagementService: LoanManagementService,
    private installmentService: InstallmentsService,
    private installmentFactoryService: InstallmentFactoryService,
    private commissionService: CommissionsService,
    private employeeService: EmployeesService,
    private transactionService: TransactionsService,
    private dataSource: DataSource,
  ) {}

  async summary(params: FilterPaymentsDto) {
    const { isReceived, employeeId } = params
    const query = this.dataSource
      .createQueryBuilder(Payment, 'payments')
      .select(
        'SUM(payments.capital) AS capital, SUM(payments.interest) AS interest, SUM(payments.total) AS total',
      )
      .leftJoin('payments.installments', 'installment')
      .leftJoin('installment.loan', 'loan')
      .leftJoin('loan.customer', 'customer')
      .leftJoin('loan.employee', 'employee')
      .where('payments.is_received = :isReceived', { isReceived })

    if (employeeId) query.andWhere('loan.employee_id = :employeeId', { employeeId })

    const rs = await query.getRawOne()
    return rs
  }

  async findAll(params: FilterPaymentsDto) {
    const { isReceived, employeeId } = params
    // ? Query base
    const payments = this.dataSource
      .createQueryBuilder(Payment, 'payments')
      .leftJoinAndSelect('payments.installments', 'installment')
      .leftJoinAndSelect('payments.loan', 'loan')
      .leftJoinAndSelect('loan.customer', 'customer')
      .leftJoinAndSelect('loan.employee', 'employee')
      .where('payments.is_received = :isReceived', { isReceived })

    if (employeeId) payments.andWhere('loan.employee_id = :employeeId', { employeeId })

    payments
      .take(params.itemsPerPage)
      .skip(params.itemsPerPage * (params.page - 1))
      .orderBy('payments.id', 'ASC')

    const [data, counter] = await payments.getManyAndCount()
    return {
      data,
      total: counter,
      currentPage: params.page,
      itemsPerPage: params.itemsPerPage,
    }
  }

  async findAllByLoan(params: GetLoanPaymentsDto) {
    const query = this.dataSource
      .createQueryBuilder(Payment, 'payments')
      .leftJoinAndSelect('payments.installments', 'installment')
      .leftJoinAndSelect('payments.paymentMethod', 'paymentMethod')
      .where('payments.loanId = :loanId', { loanId: params.loanId })
      .take(params.itemsPerPage)
      .skip(params.itemsPerPage * (params.page - 1))
      .orderBy('payments.id', 'DESC')

    const [data, counter] = await query.getManyAndCount()

    return {
      data,
      total: counter,
      currentPage: params.page,
      itemsPerPage: params.itemsPerPage,
    }
  }

  async transactionalCreate(
    manager: EntityManager,
    createPaymentDto: CreatePaymentDto,
  ): Promise<number> {
    const rs = await manager.insert(Payment, createPaymentDto)
    const paymentId = rs.identifiers[0].id

    // Si es un pago extra a capital, no se relaciona con cuotas
    if (createPaymentDto?.installmentIds?.length > 0) {
      await manager
        .createQueryBuilder()
        .relation(Payment, 'installments')
        .of(paymentId)
        .add(createPaymentDto.installmentIds)
    }

    return paymentId
  }

  async addPayment(paymentDto: AddPaymentDto) {
    const loan = await this.loanManagementService.findOne(paymentDto.loanId, [
      'employee',
      'customer',
    ])

    /*
    Se deshabilita temporalmente la validación de cuotas atrasadas
    if (paymentDto.capital > 0) {
      await this.validatePaymentToCapital(loan.id, paymentDto.installmentId)
    }
    */
    if (!paymentDto.installments) {
      throw new UnprocessableEntityException('Los pagos deben ser mayor a 0')
    }

    return await this.processInstallmentPayment(paymentDto, loan)
  }

  async capitalPayment(paymentDto: NewCapitalPaymentDto) {
    const loan = await this.loanManagementService.findOne(paymentDto.loanId, ['employee'])
    return await this.processCapitalPayment(paymentDto, loan)
  }

  validateMultipleInstallments(paymentDto: AddPaymentDto) {
    if (paymentDto.customInterest > 0)
      throw new BadRequestException(
        'El pago de intereses agregados o parciales solo es permitido para una cuota',
      )
    if (paymentDto.capital > 0)
      throw new BadRequestException('El pago a capital solo es permitido para una cuota')
  }
  @Transactional()
  private async processInstallmentPayment(
    paymentDto: AddPaymentDto,
    loan: Loan,
    manager?: EntityManager,
  ) {
    try {
      const employeeId = loan.employee.id
      const installmentsNumber = paymentDto.installments.length
      const isMultiPayment = installmentsNumber > 1

      if (isMultiPayment) this.validateMultipleInstallments(paymentDto)

      const installmentsIds = paymentDto.installments
      const installments = await this.installmentService.findAll({
        id: In(installmentsIds),
      })
      const installmentMap = Object.fromEntries(
        installments.map((installment) => [installment.id, installment]),
      )
      const updateDtos = this.installmentFactoryService.generateInstallmentObject(
        installmentMap,
        paymentDto,
        loan.installmentTypeId,
      )

      let totalToCapital = 0
      let totalToInterest = 0
      let totalCommission = 0
      let installmentsPaid = 0
      const commissionDetails = []
      for (const installmentId of paymentDto.installments) {
        const origInstallment = installmentMap[installmentId]
        const dto = updateDtos[installmentId]
        const interestToPay = dto.interestPaid - origInstallment.interestPaid

        totalToCapital += dto.capital
        totalToInterest += interestToPay

        await this.installmentService.makePayment(manager, installmentId, dto)

        // Generate Commission Details
        const isPaid = dto.installmentStateId === INSTALLMENT_STATES.PAID
        if (loan.commissionRate > 0 && isPaid) {
          installmentsPaid++
          const commissionAmount = (origInstallment.interest * loan.commissionRate) / 100
          totalCommission += commissionAmount
          commissionDetails.push({
            installmentId,
            amount: commissionAmount,
          })
        }
      }

      // ? Crear el pago
      const paymentId = await this.transactionalCreate(manager, {
        loanId: loan.id,
        paymentMethodId: paymentDto.paymentMethodId,
        capital: totalToCapital,
        interest: totalToInterest,
        total: totalToCapital + totalToInterest,
        date: paymentDto.paymentDate,
        installmentIds: installmentsIds,
        paymentTypeId: PAYMENT_TYPES.NORMAL_INSTALLMENT,
      })

      // ? Crear la comisión
      if (totalCommission > 0) {
        const commissionDto: CreateCommissionDto = {
          employeeId: loan.employeeId,
          paymentId: paymentId,
          interestAmount: totalToInterest,
          amount: totalCommission,
          rate: loan.commissionRate,
          isPaid: false,
        }

        await this.commissionService.transactionalCreate(manager, commissionDto, commissionDetails)
        await this.employeeService.transactionalUpdateBalance(manager, employeeId, totalCommission)
      }

      // ? Realizar la transacción
      if (totalToCapital > 0) {
        await this.transactionService.transaction(
          {
            flowType: 'INFLOW',
            walletId: WALLET_TYPES.CAPITAL,
            amount: totalToCapital,
            description: `Abono a capital, préstamo ${loan.id}, cliente ${loan.customer.name}`,
            loanId: loan.id,
            transactionTypeId: TRANSACTION_TYPES.PAYMENT,
            transactionCategoryId: TRANSACTION_CATEGORIES.PAYMENT,
            date: paymentDto.paymentDate,
          },
          manager,
        )
      }
      if (totalToInterest > 0) {
        await this.transactionService.transaction(
          {
            flowType: 'INFLOW',
            walletId: WALLET_TYPES.UTILITY,
            amount: totalToInterest,
            description: `Pago de intereses, préstamo ${loan.id}, cliente ${loan.customer.name}`,
            loanId: loan.id,
            transactionTypeId: TRANSACTION_TYPES.PAYMENT,
            transactionCategoryId: TRANSACTION_CATEGORIES.INTEREST,
            date: paymentDto.paymentDate,
          },
          manager,
        )
      }

      // ? Calcular los días de atraso
      const daysLate = await this.installmentService.calculateDaysLate(loan.id, manager)

      // ? Actualizar los datos del préstamo
      await this.loanManagementService.updateLoanAfterPayment(
        manager,
        loan,
        totalToInterest,
        totalToCapital,
        daysLate,
        totalCommission,
        installmentsPaid,
      )
    } catch (error) {
      console.error('Error al procesar el pago', error)
      throw new InternalServerErrorException(error)
    }
  }

  @Transactional()
  async processCapitalPayment(
    paymentDto: NewCapitalPaymentDto,
    loan: Loan,
    manager?: EntityManager,
  ) {
    /*
    Se deshabilita temporalmente la validación de cuotas atrasadas
    await this.validatePaymentToCapital(loan.id)
    */

    const { capital } = paymentDto

    // ? Crear el pago
    const paymentRs = await this.transactionalCreate(manager, {
      loanId: loan.id,
      paymentMethodId: paymentDto.paymentMethodId,
      capital,
      interest: 0,
      total: capital,
      installmentIds: [],
      date: paymentDto.paymentDate,
      paymentTypeId: PAYMENT_TYPES.EXTRA_CAPITAL,
    })
    const interestPaid = 0
    const daysLate = 0
    const commission = 0
    const installmentsPaid = 1

    // ? Realizar la transacción
    await this.transactionService.transaction(
      {
        flowType: 'INFLOW',
        walletId: WALLET_TYPES.CAPITAL,
        amount: capital,
        description: `Pago a capital crédito ID${loan.id}`,
        loanId: loan.id,
        transactionTypeId: TRANSACTION_TYPES.PAYMENT,
        transactionCategoryId: TRANSACTION_CATEGORIES.PAYMENT,
        date: paymentDto.paymentDate,
      },
      manager,
    )

    await this.loanManagementService.updateLoanAfterPayment(
      manager,
      loan,
      interestPaid,
      capital,
      daysLate,
      commission,
      installmentsPaid,
    )

    return paymentRs
  }

  async markAsReceived(markDto: MarkPaymentAsReceived) {
    await this.dataSource
      .createQueryBuilder()
      .update(Payment)
      .set({ isReceived: 1 })
      .whereInIds(markDto.paymentIds)
      .execute()
  }

  private async hasUnpaidInstallments(loanId: number, installmentId?: number): Promise<Boolean> {
    const installments = await this.installmentService.findUnpaidInstallments(loanId, installmentId)
    return !!installments.length
  }

  private async validatePaymentToCapital(loanId: number, installmentId?: number) {
    const hasInstallments = await this.hasUnpaidInstallments(loanId, installmentId)
    if (hasInstallments) {
      throw new UnprocessableEntityException('Operación inválida, existen cuotas sin pagar')
    }
  }
}
