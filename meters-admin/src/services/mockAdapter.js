/**
 * Mock-адаптер Axios: имитирует REST API бэкенда публичной части сайта.
 * Включается переменной окружения VITE_USE_MOCKS=true.
 * Компоненты и хранилища работают через тот же экземпляр api, поэтому
 * переход на реальный бэкенд не требует изменения их кода.
 */
import { AxiosError } from 'axios'
import * as db from '@/mocks/db'

const DELAY_MS = 250

const collections = {
  users: db.users,
  meters: db.meters,
  tariffs: db.tariffs,
  readings: db.readings,
  receipts: db.receipts,
}

const nextId = (list) => list.reduce((max, item) => Math.max(max, item.id), 0) + 1

/** Присоединяет к показанию данные счётчика и абонента (как JOIN на сервере). */
function expandReading(reading) {
  const meter = db.meters.find((m) => m.id === reading.meterId) || {}
  const user = db.users.find((u) => u.id === meter.userId) || {}
  const consumption = Math.max(reading.current - reading.prev, 0)
  return {
    ...reading,
    meterNumber: meter.number,
    resource: meter.resource,
    userName: user.name,
    consumption,
    amount: Math.round(consumption * reading.tariff * 100) / 100,
  }
}

function expandMeter(meter) {
  const user = db.users.find((u) => u.id === meter.userId) || {}
  return { ...meter, userName: user.name, address: user.address }
}

function expandReceipt(receipt) {
  const user = db.users.find((u) => u.id === receipt.userId) || {}
  return { ...receipt, userName: user.name, account: user.account }
}

const expanders = { readings: expandReading, meters: expandMeter, receipts: expandReceipt }
const expand = (name, item) => (expanders[name] ? expanders[name](item) : { ...item })

function dashboard() {
  const month = '2026-10'
  const monthReadings = db.readings.filter((r) => r.date.startsWith(month))
  const consumptionByResource = { electricity: 0, water: 0, gas: 0 }
  monthReadings
    .filter((r) => r.status === 'approved' || r.status === 'pending')
    .map(expandReading)
    .forEach((r) => (consumptionByResource[r.resource] += r.consumption))

  return {
    stats: {
      users: db.users.filter((u) => u.role === 'abonent').length,
      meters: db.meters.length,
      readingsMonth: monthReadings.length,
      pending: db.readings.filter((r) => r.status === 'pending').length,
      debt: db.receipts.filter((r) => r.status !== 'paid').reduce((s, r) => s + r.amount, 0),
    },
    consumptionByResource,
    activity: db.activity,
    latestReadings: [...db.readings]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5)
      .map(expandReading),
    verificationSoon: db.meters
      .filter((m) => m.verifiedUntil <= '2027-01-31' && m.status !== 'disabled')
      .map(expandMeter),
    debtors: db.receipts.filter((r) => r.status !== 'paid').map(expandReceipt),
  }
}

/** Таблица маршрутов: [метод, шаблон пути, обработчик]. */
const routes = [
  [
    'post',
    /^\/auth\/login$/,
    ({ body }) => {
      if (!body.phone || !body.password || body.password.length < 4) {
        return [401, { message: 'Неверный номер телефона или пароль' }]
      }
      return [200, { accessToken: 'demo-token-' + Date.now(), user: db.users[0] }]
    },
  ],
  ['get', /^\/auth\/me$/, () => [200, db.users[0]]],
  ['get', /^\/dashboard$/, () => [200, dashboard()]],
  [
    'patch',
    /^\/readings\/(\d+)\/status$/,
    ({ params, body }) => {
      const item = db.readings.find((r) => r.id === Number(params[0]))
      if (!item) return [404, { message: 'Показание не найдено' }]
      Object.assign(item, { status: body.status, comment: body.comment || '' })
      return [200, expandReading(item)]
    },
  ],
  [
    'post',
    /^\/notifications$/,
    ({ body }) => [201, { id: Date.now(), ...body, sentAt: new Date().toISOString() }],
  ],

  // Универсальные CRUD-маршруты для коллекций
  [
    'get',
    /^\/(\w+)$/,
    ({ params }) => {
      const list = collections[params[0]]
      return list
        ? [200, list.map((item) => expand(params[0], item))]
        : [404, { message: 'Not found' }]
    },
  ],
  [
    'get',
    /^\/(\w+)\/(\d+)$/,
    ({ params }) => {
      const item = collections[params[0]]?.find((i) => i.id === Number(params[1]))
      return item ? [200, expand(params[0], item)] : [404, { message: 'Запись не найдена' }]
    },
  ],
  [
    'post',
    /^\/(\w+)$/,
    ({ params, body }) => {
      const list = collections[params[0]]
      if (!list) return [404, { message: 'Not found' }]
      const item = { ...body, id: nextId(list) }
      list.push(item)
      return [201, expand(params[0], item)]
    },
  ],
  [
    /^(put|patch)$/,
    /^\/(\w+)\/(\d+)$/,
    ({ params, body }) => {
      const item = collections[params[0]]?.find((i) => i.id === Number(params[1]))
      if (!item) return [404, { message: 'Запись не найдена' }]
      Object.assign(item, body, { id: item.id })
      return [200, expand(params[0], item)]
    },
  ],
  [
    'delete',
    /^\/(\w+)\/(\d+)$/,
    ({ params }) => {
      const list = collections[params[0]]
      const index = list ? list.findIndex((i) => i.id === Number(params[1])) : -1
      if (index === -1) return [404, { message: 'Запись не найдена' }]
      list.splice(index, 1)
      return [204, null]
    },
  ],
]

export default function mockAdapter(config) {
  const method = config.method.toLowerCase()
  const url = config.url.replace(/^\/api/, '').split('?')[0]
  const body = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : config.data || {}

  const route = routes.find(
    ([m, pattern]) => (m instanceof RegExp ? m.test(method) : m === method) && pattern.test(url),
  )
  const [status, data] = route
    ? route[2]({ params: url.match(route[1]).slice(1), body, query: config.params || {} })
    : [404, { message: `Mock: маршрут ${method.toUpperCase()} ${url} не найден` }]

  const response = { data, status, statusText: String(status), headers: {}, config, request: {} }

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (status >= 400) {
        reject(new AxiosError(data.message, AxiosError.ERR_BAD_RESPONSE, config, null, response))
      } else {
        resolve(response)
      }
    }, DELAY_MS)
  })
}
