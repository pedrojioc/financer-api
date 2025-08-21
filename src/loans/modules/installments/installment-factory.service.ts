import { Injectable, UnprocessableEntityException } from '@nestjs/common'
import { Installment } from 'src/loans/modules/installments/entities/installment.entity'
import { NewPaymentDto } from 'src/loans/modules/payments/dtos/new-payment.dto'
import { UpdateInstallmentDto } from 'src/loans/modules/installments/dtos/update-installment.dto'
import { INSTALLMENT_STATES } from 'src/loans/modules/installments/constants/installments.c'
import { PayOffDto } from 'src/loans/dtos/pay-off.dto'
import { INSTALLMENT_TYPES } from 'src/loans/modules/installments/constants/installments.c'

interface InstallmentsDirectory {
  [installmentId: string]: Installment
}

interface InstallmentsObjects {
  [installmentId: string]: UpdateInstallmentDto
}
@Injectable()
export class InstallmentFactoryService {
  generateInstallmentObject(
    installments: InstallmentsDirectory,
    paymentDto: NewPaymentDto | PayOffDto,
    installmentTypeId: number,
  ): InstallmentsObjects {
    const installmentsObjects = {}
    for (const installmentId of paymentDto.installments) {
      const installment = installments[installmentId]
      let interestToPay = installment.interest - installment.interestPaid

      if (paymentDto.customInterest) {
        interestToPay = paymentDto.customInterest
      }

      const interestPaid = Number(interestToPay) + Number(installment.interestPaid)

      if (interestPaid < installment.interest && paymentDto.capital > 0) {
        throw new UnprocessableEntityException('Intereses pendientes, pago a capital rechazado')
      }

      // const { capital } = installmentPayment
      const capital =
        installmentTypeId === INSTALLMENT_TYPES.FIXED ? installment.capital : paymentDto.capital
      const total = Number(interestPaid) + Number(capital)
      const installmentData: UpdateInstallmentDto = {
        capital,
        interestPaid,
        total,
      }
      if (interestPaid >= installment.interest) {
        installmentData.installmentStateId = INSTALLMENT_STATES.PAID
        installmentData.paymentDate = paymentDto.paymentDate
      }

      // Add the installment data to the installmentsObjects
      installmentsObjects[installmentId] = installmentData
    }

    return installmentsObjects
  }

  generateObjectForBulkUpdate(): UpdateInstallmentDto {
    return {
      capital: 0,
      interestPaid: 0,
      total: 0,
      installmentStateId: INSTALLMENT_STATES.PAID,
    }
  }

  applyInstallmentUpdate(
    installmentId: number,
    updateDto: UpdateInstallmentDto,
    manager: any,
  ): Promise<void> {
    return manager
      .createQueryBuilder()
      .update(Installment)
      .set(updateDto)
      .where('id = :id', { id: installmentId })
      .execute()
  }
}
