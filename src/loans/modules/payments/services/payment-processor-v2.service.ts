import { Injectable, BadRequestException, UnprocessableEntityException } from '@nestjs/common'
import { EntityManager, In } from 'typeorm'
import { Loan } from 'src/loans/entities/loan.entity'
import { Installment } from 'src/loans/modules/installments/entities/installment.entity'
import { ProcessPaymentV2Dto, InstallmentPaymentDto } from '../dtos/process-payment-v2.dto'
import { UpdateInstallmentDto } from '../../installments/dtos/update-installment.dto'
import { INSTALLMENT_TYPES, INSTALLMENT_STATES } from '../../installments/constants/installments.c'
import { InstallmentsService } from '../../installments/installments.service'

export interface PaymentProcessingResult {
  totalCapital: number
  totalInterest: number
  installmentUpdates: { [installmentId: number]: UpdateInstallmentDto }
  installmentsPaid: number
  commissionDetails: Array<{ installmentId: number; amount: number }>
  totalCommission: number
}
interface InstallmentMap {
  [installmentId: number]: Installment
}

@Injectable()
export class PaymentProcessorV2Service {
  constructor(private installmentsService: InstallmentsService) {}

  async processPayment(
    paymentDto: ProcessPaymentV2Dto,
    loan: Loan,
    manager?: EntityManager,
  ): Promise<PaymentProcessingResult> {
    await this.validatePayment(paymentDto, loan)

    const installmentIds = paymentDto.installmentPayments.map((ip) => ip.id)
    const installments = await this.installmentsService.findAll({ id: In(installmentIds) })

    if (installments.length !== installmentIds.length) {
      throw new BadRequestException('Una o más cuotas no fueron encontradas')
    }

    const installmentMap = Object.fromEntries(
      installments.map((installment) => [installment.id, installment]),
    )

    return this.calculatePaymentDistribution(paymentDto, loan, installmentMap)
  }

  private async validatePayment(paymentDto: ProcessPaymentV2Dto, loan: Loan): Promise<void> {
    if (paymentDto.installmentPayments.length === 0) {
      throw new BadRequestException('Debe especificar al menos una cuota a pagar')
    }

    if (loan.installmentTypeId === INSTALLMENT_TYPES.FIXED) {
      await this.validateFixedInstallmentPayment(paymentDto)
    } else if (loan.installmentTypeId === INSTALLMENT_TYPES.FLEXIBLE) {
      await this.validateFlexibleInstallmentPayment(paymentDto)
    }
  }

  private async validateFixedInstallmentPayment(paymentDto: ProcessPaymentV2Dto): Promise<void> {
    for (const installmentPayment of paymentDto.installmentPayments) {
      if (installmentPayment.capital && installmentPayment.capital > 0) {
        throw new BadRequestException(
          'En cuotas fijas, el monto de capital está predeterminado. No se puede especificar capital',
        )
      }
    }
  }

  private async validateFlexibleInstallmentPayment(paymentDto: ProcessPaymentV2Dto): Promise<void> {
    for (const installmentPayment of paymentDto.installmentPayments) {
      if (!installmentPayment.capital || installmentPayment.capital <= 0) {
        throw new BadRequestException(
          'En cuotas flexibles, debe especificar el capital para cada cuota',
        )
      }
    }
  }

  private calculatePaymentDistribution(
    paymentDto: ProcessPaymentV2Dto,
    loan: Loan,
    installmentMap: { [id: number]: Installment },
  ): PaymentProcessingResult {
    let totalCapital = 0
    let totalInterest = 0
    let totalCommission = 0
    let installmentsPaid = 0
    const installmentUpdates: { [installmentId: number]: UpdateInstallmentDto } = {}
    const commissionDetails: Array<{ installmentId: number; amount: number }> = []

    for (const installmentPayment of paymentDto.installmentPayments) {
      const installment = installmentMap[installmentPayment.id]
      const result = this.calculateInstallmentPayment(
        installmentPayment,
        installment,
        loan,
        paymentDto.paymentDate,
      )

      totalCapital += result.capitalPayment
      totalInterest += result.interestPayment
      installmentUpdates[installmentPayment.id] = result.updateDto

      if (result.isPaid && loan.commissionRate > 0) {
        installmentsPaid++
        const commissionAmount = (installment.interest * loan.commissionRate) / 100
        totalCommission += commissionAmount
        commissionDetails.push({
          installmentId: installmentPayment.id,
          amount: commissionAmount,
        })
      }
    }

    return {
      totalCapital,
      totalInterest,
      installmentUpdates,
      installmentsPaid,
      commissionDetails,
      totalCommission,
    }
  }

  private calculateInstallmentPayment(
    installmentPayment: InstallmentPaymentDto,
    installment: Installment,
    loan: Loan,
    paymentDate: Date,
  ): {
    capitalPayment: number
    interestPayment: number
    updateDto: UpdateInstallmentDto
    isPaid: boolean
  } {
    const pendingInterest = installment.interest - installment.interestPaid
    const pendingCapital = installment.capital - installment.capitalPaid

    let interestToApply = 0
    let capitalToApply = 0

    if (loan.installmentTypeId === INSTALLMENT_TYPES.FIXED) {
      interestToApply = installmentPayment.interest || pendingInterest
      capitalToApply = pendingCapital
    } else {
      interestToApply = installmentPayment.interest || pendingInterest
      capitalToApply = installmentPayment.capital || 0
    }

    if (interestToApply > pendingInterest) {
      throw new BadRequestException(
        `El monto de intereses (${interestToApply}) excede el pendiente (${pendingInterest}) para la cuota ${installment.id}`,
      )
    }

    if (capitalToApply > 0 && interestToApply < pendingInterest) {
      throw new UnprocessableEntityException(
        `Debe pagar primero todos los intereses pendientes antes de aplicar capital a la cuota ${installment.id}`,
      )
    }

    if (capitalToApply > pendingCapital) {
      throw new BadRequestException(
        `El monto de capital (${capitalToApply}) excede el pendiente (${pendingCapital}) para la cuota ${installment.id}`,
      )
    }

    const newInterestPaid = installment.interestPaid + interestToApply
    const newCapitalPaid = installment.capitalPaid + capitalToApply
    const newTotalPaid = newInterestPaid + newCapitalPaid

    const isPaid = newInterestPaid >= installment.interest && newCapitalPaid >= installment.capital

    const updateDto: UpdateInstallmentDto = {
      interestPaid: newInterestPaid,
      capitalPaid: newCapitalPaid,
      totalPaid: newTotalPaid,
      installmentStateId: isPaid ? INSTALLMENT_STATES.PAID : installment.installmentStateId,
      paymentDate: isPaid ? paymentDate : installment.paymentDate,
    }

    return {
      capitalPayment: capitalToApply,
      interestPayment: interestToApply,
      updateDto,
      isPaid,
    }
  }

  private validateFixedInstallmentPayment2(
    installmentMap: InstallmentMap,
    paymentDto: ProcessPaymentV2Dto,
  ): void {
    let pendingInterest = 0
    let totalInterestToPay = 0
    let capitalToPay = 0
    for (const installmentPayment of paymentDto.installmentPayments) {
      const installment = installmentMap[installmentPayment.id]
      pendingInterest += installment.interest - installment.interestPaid
      totalInterestToPay += installmentPayment.interest
      capitalToPay += installmentPayment.capital || 0
    }

    if (pendingInterest > totalInterestToPay && capitalToPay > 0) {
      throw new BadRequestException('No puedes pagar capital si hay intereses pendientes')
    }
  }

  calculateInstallmentPayment2(
    installment: Installment,
    installmentPayment: InstallmentPaymentDto,
    installmentTypeId: number,
  ) {
    const pendingInterest = installment.interest - installment.interestPaid

    const interestToApply = installmentPayment.interest || pendingInterest
    let capitalToApply = installmentPayment.capital

    if (installmentTypeId === INSTALLMENT_TYPES.FLEXIBLE) {
      capitalToApply = installmentPayment.capital || 0
    }

    return {
      interestToApply,
      capitalToApply,
    }
  }

  async applyPaymentToInstallments(paymentDto: ProcessPaymentV2Dto, loan: Loan) {
    const installmentsIds = paymentDto.installmentPayments.map((ip) => ip.id)
    const installments = await this.installmentsService.findAll({ id: In(installmentsIds) })
    const installmentMap = Object.fromEntries(
      installments.map((installment) => [installment.id, installment]),
    )

    if (loan.installmentTypeId === INSTALLMENT_TYPES.FIXED) {
      this.validateFixedInstallmentPayment2(installmentMap, paymentDto)
    }

    let totalToCapital = 0
    let totalToInterest = 0
    let totalCommission = 0
    let installmentsPaid = 0
    const commissionDetails = []
    const installmentsToUpdate = []
    for (const installmentPayment of paymentDto.installmentPayments) {
      const installment = installmentMap[installmentPayment.id]

      const { interestToApply, capitalToApply } = this.calculateInstallmentPayment2(
        installment,
        installmentPayment,
        loan.installmentTypeId,
      )

      totalToInterest += interestToApply
      totalToCapital += capitalToApply

      const newInterestPaid = installment.interestPaid + interestToApply
      const newCapitalPaid = installment.capitalPaid + capitalToApply
      const newTotalPaid = newInterestPaid + newCapitalPaid

      const isPaid =
        newInterestPaid >= installment.interest && newCapitalPaid >= installment.capital

      const installmentUpdateDto: UpdateInstallmentDto = {
        interestPaid: newInterestPaid,
        capitalPaid: newCapitalPaid,
        totalPaid: newTotalPaid,
        installmentStateId: isPaid ? INSTALLMENT_STATES.PAID : installment.installmentStateId,
        paymentDate: isPaid ? paymentDto.paymentDate : installment.paymentDate,
      }
      installmentsToUpdate.push({
        id: installment.id,
        updateDto: installmentUpdateDto,
      })

      if (isPaid) {
        installmentsPaid++
        if (loan.commissionRate > 0) {
          const commissionAmount = (installment.interest * loan.commissionRate) / 100
          totalCommission += commissionAmount
          commissionDetails.push({
            installmentId: installmentPayment.id,
            amount: commissionAmount,
          })
        }
      }
    }

    return {
      installmentsPaid,
      totalCommission,
      commissionDetails,
      installmentsToUpdate,
      totalCapital: totalToCapital,
      totalInterest: totalToInterest,
      installmentsIds,
    }
  }
}
