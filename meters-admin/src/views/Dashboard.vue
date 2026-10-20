<script setup>
import { onMounted } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import StatCard from '@/components/StatCard.vue'
import ActivityChart from '@/components/ActivityChart.vue'
import ResourceBadge from '@/components/ResourceBadge.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import {
  RESOURCES,
  READING_STATUSES,
  RECEIPT_STATUSES,
  formatDate,
  formatMoney,
  formatNumber,
  formatPeriod,
} from '@/utils/format'

const store = useDashboardStore()

onMounted(() => {
  store.fetchDashboard()
})
</script>

<template>
  <section>
    <div class="page-header">
      <div>
        <h1>Дашборд</h1>
        <p>Сводка по передаче показаний за текущий месяц</p>
      </div>
      <RouterLink to="/readings?status=pending" class="btn btn--primary"
        >Проверить показания</RouterLink
      >
    </div>

    <p v-if="store.loading && !store.data" class="muted">Загрузка…</p>
    <div v-else-if="store.error" class="alert alert--error">{{ store.error }}</div>

    <div v-else-if="store.data" class="stack">
      <div class="grid grid--stats">
        <StatCard label="Абоненты" :value="formatNumber(store.data.stats.users)" icon="☺" />
        <StatCard label="Счётчики" :value="formatNumber(store.data.stats.meters)" icon="⏲" />
        <StatCard
          label="Показаний за месяц"
          :value="formatNumber(store.data.stats.readingsMonth)"
          icon="✎"
          tone="success"
        />
        <StatCard
          label="Ожидают проверки"
          :value="formatNumber(store.data.stats.pending)"
          icon="!"
          tone="warning"
        />
        <StatCard
          label="Задолженность"
          :value="formatMoney(store.data.stats.debt)"
          icon="₽"
          tone="error"
        />
      </div>

      <div class="grid grid--main">
        <article class="card">
          <div class="card__header">
            <h2>Активность передачи показаний</h2>
            <span class="muted">последние 14 дней</span>
          </div>
          <ActivityChart :points="store.data.activity" />
        </article>

        <article class="card">
          <div class="card__header"><h2>Потребление за месяц</h2></div>
          <ul class="consumption">
            <li v-for="(value, key) in store.data.consumptionByResource" :key="key">
              <ResourceBadge :resource="key" />
              <strong>{{ formatNumber(value) }} {{ RESOURCES[key].unit }}</strong>
            </li>
          </ul>
        </article>
      </div>

      <article class="card">
        <div class="card__header">
          <h2>Последние показания</h2>
          <RouterLink to="/readings">Все показания →</RouterLink>
        </div>
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Абонент</th>
                <th>Ресурс</th>
                <th>№ счётчика</th>
                <th class="num">Расход</th>
                <th class="num">Сумма</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in store.data.latestReadings" :key="r.id">
                <td>{{ formatDate(r.date) }}</td>
                <td>{{ r.userName }}</td>
                <td><ResourceBadge :resource="r.resource" /></td>
                <td>{{ r.meterNumber }}</td>
                <td class="num">
                  {{ formatNumber(r.consumption) }} {{ RESOURCES[r.resource].unit }}
                </td>
                <td class="num">{{ formatMoney(r.amount) }}</td>
                <td><StatusBadge :value="r.status" :dictionary="READING_STATUSES" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>

      <div class="grid grid--2">
        <article class="card">
          <div class="card__header">
            <h2>Истекает срок поверки</h2>
            <RouterLink to="/meters">Счётчики →</RouterLink>
          </div>
          <div class="table-wrap">
            <table class="table">
              <tbody>
                <tr v-for="m in store.data.verificationSoon" :key="m.id">
                  <td>№ {{ m.number }}</td>
                  <td><ResourceBadge :resource="m.resource" /></td>
                  <td>{{ m.userName }}</td>
                  <td class="num">до {{ formatDate(m.verifiedUntil) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>

        <article class="card">
          <div class="card__header">
            <h2>Неоплаченные квитанции</h2>
            <RouterLink to="/receipts">Квитанции →</RouterLink>
          </div>
          <div class="table-wrap">
            <table class="table">
              <tbody>
                <tr v-for="d in store.data.debtors" :key="d.id">
                  <td>{{ d.userName }}</td>
                  <td>{{ formatPeriod(d.period) }}</td>
                  <td class="num">{{ formatMoney(d.amount) }}</td>
                  <td><StatusBadge :value="d.status" :dictionary="RECEIPT_STATUSES" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.consumption {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.consumption li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 0.9rem;
  border-bottom: 1px solid var(--gray-100);
}

.consumption strong {
  font-size: 1.15rem;
}
</style>
