import { createCrudStore } from './createCrudStore'

export const useReceiptsStore = createCrudStore('receipts', '/receipts')
