import { createCrudStore } from './createCrudStore'

/** Показания счётчиков: CRUD + модерация (принять / отклонить). */
export const useReadingsStore = createCrudStore(
  'readings',
  '/readings',
  ({ replace, mutate }, api) => ({
    async setStatus(id, status, comment = '') {
      return mutate(async () => {
        const response = await api.patch(`/readings/${id}/status`, { status, comment })
        replace(response.data)
        return response.data
      })
    },
  }),
)
