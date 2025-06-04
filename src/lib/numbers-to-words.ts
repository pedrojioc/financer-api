/**
 *
 * Examples:
 *   1000000 -> "UN MILLÓN DE PESOS"
 *    500000 -> "QUINIENTOS MIL PESOS"
 *   2500000 -> "DOS MILLONES QUINIENTOS MIL PESOS"
 */

const UNITS = [
  '',
  'UNO',
  'DOS',
  'TRES',
  'CUATRO',
  'CINCO',
  'SEIS',
  'SIETE',
  'OCHO',
  'NUEVE',
  'DIEZ',
  'ONCE',
  'DOCE',
  'TRECE',
  'CATORCE',
  'QUINCE',
  'DIECISÉIS',
  'DIECISIETE',
  'DIECIOCHO',
  'DIECINUEVE',
]
const TENS = [
  '',
  '',
  'VEINTE',
  'TREINTA',
  'CUARENTA',
  'CINCUENTA',
  'SESENTA',
  'SETENTA',
  'OCHENTA',
  'NOVENTA',
]
const HUNDREDS = [
  '',
  'CIENTO',
  'DOSCIENTOS',
  'TRESCIENTOS',
  'CUATROCIENTOS',
  'QUINIENTOS',
  'SEISCIENTOS',
  'SETECIENTOS',
  'OCHOCIENTOS',
  'NOVECIENTOS',
]

/**
 * Converts a number between 0 and 999 into words in UPPERCASE.
 */
function hundredsToText(n: number): string {
  let text = ''

  if (n >= 100) {
    if (n === 100) {
      return 'CIEN'
    }
    const hundreds = Math.floor(n / 100)
    text += HUNDREDS[hundreds]
    n = n % 100
    if (n > 0) {
      text += ' '
    }
  }

  if (n >= 20) {
    const tens = Math.floor(n / 10)
    text += TENS[tens]
    const unit = n % 10
    if (unit > 0) {
      if (tens === 2) {
        // 21–29 as VEINTIUNO, VEINTIDÓS, etc.
        text = 'VEINTI' + UNITS[unit]
      } else {
        text += ' Y ' + UNITS[unit]
      }
    }
  } else if (n > 0) {
    text += UNITS[n]
  }

  return text
}

/**
 * Converts an integer (0 ≤ n < 1_000_000_000) into words in UPPERCASE.
 */
function numberToText(n: number): string {
  if (n === 0) {
    return 'CERO'
  }

  let text = ''

  // Millions
  if (n >= 1_000_000) {
    const millions = Math.floor(n / 1_000_000)
    if (millions === 1) {
      text += 'UN MILLON'
    } else {
      text += `${numberToText(millions)} MILLONES`
    }
    n = n % 1_000_000
    if (n > 0) {
      text += ' '
    }
  }

  // Thousands
  if (n >= 1_000) {
    const thousands = Math.floor(n / 1_000)
    if (thousands === 1) {
      text += 'MIL'
    } else {
      text += `${numberToText(thousands)} MIL`
    }
    n = n % 1_000
    if (n > 0) {
      text += ' '
    }
  }

  // Remainder (1–999)
  if (n > 0) {
    text += hundredsToText(n)
  }

  return text
}

/**
 * Converts a non-negative integer amount of pesos into words in Spanish UPPERCASE,
 * adding "DE PESOS" only when the number is an exact multiple of one million.
 *
 * Examples:
 *   1_000_000 -> "UN MILLÓN DE PESOS"
 *     500_000 -> "QUINIENTOS MIL PESOS"
 *   2_000_000 -> "DOS MILLONES DE PESOS"
 *   2_450_000 -> "DOS MILLONES CUATROCIENTOS CINCUENTA MIL PESOS"
 */
export function toWords(amount: number): string {
  if (!Number.isInteger(amount) || amount < 0) {
    throw new Error('Amount must be a non-negative integer.')
  }

  const words = numberToText(amount)

  // Only add "DE PESOS" if exactly multiple of 1_000_000
  if (amount >= 1_000_000 && amount % 1_000_000 === 0) {
    return `${words} DE PESOS`
  }
  return `${words} PESOS`
}
