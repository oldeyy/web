import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('accessToken'))
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => Boolean(token.value))

  async function login(phone, password) {
    loading.value = true
    error.value = null

    try {
      const response = await api.post('/auth/login', { phone, password })
      token.value = response.data.accessToken
      user.value = response.data.user
      localStorage.setItem('accessToken', token.value)
      localStorage.setItem('user', JSON.stringify(user.value))
      return true
    } catch (err) {
      error.value = err.response?.data?.message || 'Не удалось выполнить вход'
      return false
    } finally {
      loading.value = false
    }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
  }

  return { token, user, loading, error, isAuthenticated, login, logout }
})
