/** Справочники и функции форматирования, общие для всех страниц. */

export const RESOURCES = {
  electricity: { label: 'Электричество', unit: 'кВт·ч' },
  water: { label: 'Вода', unit: 'м³' },
  gas: { label: 'Газ', unit: 'м³' },
}

export const READING_STATUSES = {
  pending: { label: 'На проверке', tone: 'warning' },
  approved: { label: 'Принято', tone: 'success' },
  rejected: { label: 'Отклонено', tone: 'error' },
}

export const METER_STATUSES = {
  active: { label: 'Работает', tone: 'success' },
  verification: { label: 'Нужна поверка', tone: 'warning' },
  disabled: { label: 'Выведен', tone: 'muted' },
}

export const USER_ROLES = {
  admin: 'Администратор',
  operator: 'Оператор',
  abonent: 'Абонент',
}

export const USER_STATUSES = {
  active: { label: 'Активен', tone: 'success' },
  blocked: { label: 'Заблокирован', tone: 'error' },
}

export const RECEIPT_STATUSES = {
  paid: { label: 'Оплачена', tone: 'success' },
  unpaid: { label: 'Не оплачена', tone: 'warning' },
  overdue: { label: 'Просрочена', tone: 'error' },
}

const numberFormat = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 })

export const formatNumber = (value) => numberFormat.format(value ?? 0)

export const formatMoney = (value) => `${formatNumber(value)} ₽`

export function formatDate(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}

export function formatPeriod(period) {
  const [y, m] = period.split('-')
  const name = new Date(Number(y), Number(m) - 1).toLocaleString('ru-RU', { month: 'long' })
  return `${name[0].toUpperCase()}${name.slice(1)} ${y}`
}
