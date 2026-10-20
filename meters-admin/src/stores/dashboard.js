import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from '@/services/api'

export const useDashboardStore = defineStore('dashboard', () => {
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchDashboard() {
    loading.value = true
    error.value = null

    try {
      const response = await api.get('/dashboard')
      data.value = response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Не удалось загрузить статистику'
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, fetchDashboard }
})
