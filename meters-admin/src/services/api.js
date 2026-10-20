import axios from 'axios'
import mockAdapter from './mockAdapter'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Пока бэкенд не готов, запросы обслуживает mock-адаптер
  ...(import.meta.env.VITE_USE_MOCKS === 'true' && { adapter: mockAdapter }),
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Истёкший или недействительный токен: очищаем сессию и отправляем на вход
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }

    return Promise.reject(error)
  },
)

export default api
