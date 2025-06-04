/**
 *
 * @param amount
 * @param rate
 * @param numberOfInstallments
 * @returns
 */

export function calculateFixedInstallment(
  amount: number,
  rate: number,
  numberOfInstallments: number,
) {
  const i = rate / 100
  const n = numberOfInstallments
  return amount * (i / (1 - Math.pow(1 + i, -n)))
}
