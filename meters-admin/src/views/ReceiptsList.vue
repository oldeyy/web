<script setup>
import { computed, onMounted, ref } from 'vue'
import { useReceiptsStore } from '@/stores/receipts'
import StatusBadge from '@/components/StatusBadge.vue'
import { RECEIPT_STATUSES, formatDate, formatMoney, formatPeriod } from '@/utils/format'

const store = useReceiptsStore()
const status = ref('')
const period = ref('')

const periods = computed(() => [...new Set(store.items.map((r) => r.period))].sort().reverse())

const filtered = computed(() =>
  store.items
    .filter((r) => !status.value || r.status === status.value)
    .filter((r) => !period.value || r.period === period.value)
    .sort((a, b) => b.period.localeCompare(a.period)),
)

const total = computed(() => filtered.value.reduce((sum, r) => sum + r.amount, 0))

onMounted(() => {
  store.fetchAll()
})

function markPaid(receipt) {
  store.update(receipt.id, { ...receipt, status: 'paid' })
}
</script>

<template>
  <section>
    <div class="page-header">
      <div>
        <h1>Квитанции</h1>
        <p>Начисления абонентам и контроль оплаты</p>
      </div>
    </div>

    <div class="card">
      <div class="filters">
        <select v-model="period" class="select" aria-label="Период">
          <option value="">Все периоды</option>
          <option v-for="p in periods" :key="p" :value="p">{{ formatPeriod(p) }}</option>
        </select>
        <select v-model="status" class="select" aria-label="Статус оплаты">
          <option value="">Все статусы</option>
          <option v-for="(s, key) in RECEIPT_STATUSES" :key="key" :value="key">
            {{ s.label }}
          </option>
        </select>
      </div>

      <p v-if="store.loading" class="muted">Загрузка…</p>
      <div v-else-if="store.error" class="alert alert--error">{{ store.error }}</div>
      <div v-else class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>№</th>
              <th>Период</th>
              <th>Абонент</th>
              <th>Лицевой счёт</th>
              <th>Выставлена</th>
              <th class="num">Сумма</th>
              <th>Статус</th>
              <th class="num">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in filtered" :key="r.id">
              <td>{{ r.id }}</td>
              <td>{{ formatPeriod(r.period) }}</td>
              <td>{{ r.userName }}</td>
              <td>{{ r.account }}</td>
              <td>{{ formatDate(r.issuedAt) }}</td>
              <td class="num">
                <strong>{{ formatMoney(r.amount) }}</strong>
              </td>
              <td><StatusBadge :value="r.status" :dictionary="RECEIPT_STATUSES" /></td>
              <td>
                <div class="actions">
                  <button
                    v-if="r.status !== 'paid'"
                    class="btn btn--sm btn--secondary"
                    @click="markPaid(r)"
                  >
                    Отметить оплату
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!filtered.length">
              <td colspan="8" class="table-empty">Квитанции не найдены</td>
            </tr>
          </tbody>
          <tfoot v-if="filtered.length">
            <tr>
              <td colspan="5"><strong>Итого</strong></td>
              <td class="num">
                <strong>{{ formatMoney(total) }}</strong>
              </td>
              <td colspan="2"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </section>
</template>
