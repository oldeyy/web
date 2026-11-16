/** Маска и проверка номера телефона в формате +7 (900) 000-00-01. */

/** Только цифры номера, приведённые к виду 7XXXXXXXXXX (не более 11 цифр). */
export function phoneDigits(value) {
  let digits = value.replace(/\D/g, '')
  if (digits.startsWith('8')) digits = '7' + digits.slice(1)
  if (digits && !digits.startsWith('7')) digits = '7' + digits
  return digits.slice(0, 11)
}

/** Форматирование по мере ввода: 7900000 → +7 (900) 000 */
export function formatPhone(value) {
  const d = phoneDigits(value)
  if (!d) return ''
  let result = '+7'
  if (d.length > 1) result += ' (' + d.slice(1, 4)
  if (d.length >= 4) result += ')'
  if (d.length > 4) result += ' ' + d.slice(4, 7)
  if (d.length > 7) result += '-' + d.slice(7, 9)
  if (d.length > 9) result += '-' + d.slice(9, 11)
  return result
}

export const isPhoneComplete = (value) => phoneDigits(value).length === 11
