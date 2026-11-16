import axios from 'axios'
import mockAdapter from './mockAdapter'
import { getToken } from './session'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Пока бэкенд не готов, запросы обслуживает mock-адаптер
  ...(import.meta.env.VITE_USE_MOCKS === 'true' && { adapter: mockAdapter }),
})

// Обработчик ответа 401 задаётся в main.js: он знает о хранилище и роутере,
// а этот модуль от них не зависит (иначе получился бы циклический импорт)
let onUnauthorized = () => {}

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler
}

api.interceptors.request.use((config) => {
  const token = getToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Истёкший, отозванный или поддельный токен: завершаем сессию и отправляем на вход.
    // Запросы /auth/* обрабатывают сами: неверный пароль — форма входа, проверку токена — роутер.
    const url = error.config?.url ?? ''
    if (error.response?.status === 401 && !url.startsWith('/auth/')) {
      onUnauthorized()
    }

    return Promise.reject(error)
  },
)

export default api
