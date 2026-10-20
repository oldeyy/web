import { createCrudStore } from './createCrudStore'

export const useTariffsStore = createCrudStore('tariffs', '/tariffs')
