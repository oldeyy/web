import { createCrudStore } from './createCrudStore'

/** Абоненты и сотрудники: просмотр, смена роли, блокировка, уведомления. */
export const useUsersStore = createCrudStore('users', '/users', (state, api) => ({
  /** Отправляет уведомление одному абоненту (userId) или всем (userId = null). */
  async notify(userId, message) {
    const response = await api.post('/notifications', { userId, message })
    return response.data
  },
}))
