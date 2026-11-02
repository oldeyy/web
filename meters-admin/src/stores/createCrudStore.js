import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from '@/services/api'
import { apiErrorMessage } from '@/services/errors'

/**
 * Фабрика Pinia-хранилищ для сущностей с типовыми CRUD-операциями.
 * @param {string} id       идентификатор хранилища
 * @param {string} endpoint путь ресурса в API, например '/meters'
 * @param {Function} [extend] функция, добавляющая специфичные действия: (state, api) => ({...})
 */
export function createCrudStore(id, endpoint, extend = () => ({})) {
  return defineStore(id, () => {
    const items = ref([])
    const loading = ref(false)
    const error = ref(null)
    const actionError = ref(null) // ошибка последней операции изменения данных

    /** Выполняет операцию изменения; при ошибке сохраняет текст из ответа API и пробрасывает её. */
    async function mutate(action) {
      actionError.value = null
      try {
        return await action()
      } catch (err) {
        actionError.value = apiErrorMessage(err, 'Не удалось сохранить изменения')
        throw err
      }
    }

    async function fetchAll() {
      loading.value = true
      error.value = null

      try {
        const response = await api.get(endpoint)
        items.value = response.data
      } catch (err) {
        error.value = apiErrorMessage(err, 'Не удалось загрузить данные')
      } finally {
        loading.value = false
      }
    }

    async function fetchOne(itemId) {
      const response = await api.get(`${endpoint}/${itemId}`)
      return response.data
    }

    async function create(payload) {
      return mutate(async () => {
        const response = await api.post(endpoint, payload)
        items.value.push(response.data)
        return response.data
      })
    }

    function replace(item) {
      const index = items.value.findIndex((i) => i.id === item.id)
      if (index !== -1) items.value[index] = item
    }

    async function update(itemId, payload) {
      return mutate(async () => {
        const response = await api.put(`${endpoint}/${itemId}`, payload)
        replace(response.data)
        return response.data
      })
    }

    async function remove(itemId) {
      return mutate(async () => {
        await api.delete(`${endpoint}/${itemId}`)
        items.value = items.value.filter((i) => i.id !== itemId)
      })
    }

    const state = { items, loading, error, replace, mutate }

    return {
      items,
      loading,
      error,
      actionError,
      fetchAll,
      fetchOne,
      create,
      update,
      remove,
      ...extend(state, api),
    }
  })
}
