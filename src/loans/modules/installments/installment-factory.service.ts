import { BadRequestException, Injectable, UnprocessableEntityException } from '@nestjs/common'
import { Installment } from 'src/loans/entities/installment.entity'
import { AddPaymentDto } from '../payments/dtos/add-payment.dto'
import { UpdateInstallmentDto } from 'src/loans/dtos/update-installment.dto'
import { INSTALLMENT_STATES } from 'src/loans/constants/installments'
import { PayOffDto } from 'src/loans/dtos/pay-off.dto'
import { INSTALLMENT_TYPES } from 'src/loans/shared/constants'

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
    paymentDto: AddPaymentDto | PayOffDto,
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
}
