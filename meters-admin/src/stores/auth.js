import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import api from '@/services/api'
import { apiErrorMessage } from '@/services/errors'
import {
  loadSession,
  saveSession,
  updateSessionUser,
  clearSession,
  tokenExpiresAt,
} from '@/services/session'

/**
 * Хранилище авторизации — единый источник правды о сессии для роутера, макета и страниц.
 */
export const useAuthStore = defineStore('auth', () => {
  const saved = loadSession()

  const token = ref(saved.token)
  const user = ref(saved.user)
  const remember = ref(saved.remember)
  const expiresAt = ref(saved.token ? tokenExpiresAt(saved.token) : null)
  const verified = ref(false) // токен подтверждён сервером в этой вкладке (GET /auth/me)
  const loading = ref(false)
  const error = ref(null)
  const expired = ref(false) // сессия завершилась по истечении срока токена

  let expiryTimer = null

  const isTokenAlive = () =>
    Boolean(token.value) && (!expiresAt.value || expiresAt.value > Date.now())
  const isAuthenticated = computed(() => Boolean(token.value) && isTokenAlive())
  const isAdmin = computed(() => user.value?.role === 'admin')

  /** Таймер автоматического выхода в момент истечения токена. */
  function scheduleExpiry() {
    clearTimeout(expiryTimer)
    if (!expiresAt.value) return
    expiryTimer = setTimeout(expire, Math.max(expiresAt.value - Date.now(), 0))
  }

  function setSession(newToken, newUser, rememberMe) {
    token.value = newToken
    user.value = newUser
    remember.value = rememberMe
    expiresAt.value = tokenExpiresAt(newToken)
    verified.value = true
    expired.value = false
    saveSession(newToken, newUser, rememberMe)
    scheduleExpiry()
  }

  /** Локальное завершение сессии (без запроса к серверу). */
  function clear() {
    clearTimeout(expiryTimer)
    token.value = null
    user.value = null
    expiresAt.value = null
    verified.value = false
    clearSession()
  }

  /** Срок токена истёк или сервер ответил 401 — сессия завершается, пользователь увидит причину. */
  function expire() {
    clear()
    expired.value = true
  }

  async function login(phone, password, rememberMe = false) {
    loading.value = true
    error.value = null

    try {
      const response = await api.post('/auth/login', { phone, password })
      setSession(response.data.accessToken, response.data.user, rememberMe)
      return true
    } catch (err) {
      error.value = apiErrorMessage(err, 'Не удалось выполнить вход')
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Проверка сохранённого токена на сервере при первом переходе после загрузки страницы:
   * токен мог быть отозван, а пользователь — заблокирован. Обновляет данные пользователя.
   */
  async function verify() {
    if (!isTokenAlive()) {
      if (token.value) expire()
      return false
    }
    if (verified.value) return true

    try {
      const response = await api.get('/auth/me')
      user.value = response.data
      updateSessionUser(response.data)
      verified.value = true
      scheduleExpiry()
      return true
    } catch {
      expire()
      return false
    }
  }

  /** Выход: сервер заносит токен в список отозванных, клиент удаляет его из хранилища. */
  async function logout() {
    try {
      if (isTokenAlive()) await api.post('/auth/logout')
    } catch {
      // токен мог уже истечь — локальный выход выполняется в любом случае
    }
    clear()
    expired.value = false
  }

  return {
    token,
    user,
    remember,
    expiresAt,
    loading,
    error,
    expired,
    isAuthenticated,
    isAdmin,
    login,
    verify,
    logout,
    expire,
  }
})
