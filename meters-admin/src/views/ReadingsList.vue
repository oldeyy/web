<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useReadingsStore } from '@/stores/readings'
import ResourceBadge from '@/components/ResourceBadge.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import BaseModal from '@/components/BaseModal.vue'
import { RESOURCES, READING_STATUSES, formatDate, formatMoney, formatNumber } from '@/utils/format'

const route = useRoute()
const store = useReadingsStore()

const search = ref('')
const resource = ref('')
const status = ref(route.query.status || '')

// Модальное окно отклонения с указанием причины
const rejecting = ref(null)
const rejectComment = ref('')

const filtered = computed(() =>
  store.items
    .filter((r) => !resource.value || r.resource === resource.value)
    .filter((r) => !status.value || r.status === status.value)
    .filter((r) => {
      const q = search.value.trim().toLowerCase()
      return !q || r.userName?.toLowerCase().includes(q) || r.meterNumber?.includes(q)
    })
    .sort((a, b) => b.date.localeCompare(a.date)),
)

onMounted(() => {
  store.fetchAll()
})

function approve(reading) {
  store.setStatus(reading.id, 'approved')
}

function openReject(reading) {
  rejecting.value = reading
  rejectComment.value = ''
}

async function confirmReject() {
  await store.setStatus(rejecting.value.id, 'rejected', rejectComment.value)
  rejecting.value = null
}

function remove(reading) {
  if (
    confirm(`Удалить показание счётчика № ${reading.meterNumber} от ${formatDate(reading.date)}?`)
  ) {
    store.remove(reading.id)
  }
}
</script>

<template>
  <section>
    <div class="page-header">
      <div>
        <h1>Показания</h1>
        <p>Проверка и корректировка показаний, переданных абонентами</p>
      </div>
      <RouterLink to="/readings/create" class="btn btn--primary">+ Добавить показание</RouterLink>
    </div>

    <div class="card">
      <div class="filters">
        <input v-model="search" class="input" type="search" placeholder="Абонент или № счётчика" />
        <select v-model="resource" class="select" aria-label="Ресурс">
          <option value="">Все ресурсы</option>
          <option v-for="(r, key) in RESOURCES" :key="key" :value="key">{{ r.label }}</option>
        </select>
        <select v-model="status" class="select" aria-label="Статус">
          <option value="">Все статусы</option>
          <option v-for="(s, key) in READING_STATUSES" :key="key" :value="key">
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
              <th>Дата</th>
              <th>Абонент</th>
              <th>Ресурс</th>
              <th>№ счётч.</th>
              <th class="num">Пред.</th>
              <th class="num">Текущ.</th>
              <th class="num">Расход</th>
              <th class="num">Сумма</th>
              <th>Статус</th>
              <th class="num">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in filtered" :key="r.id">
              <td>{{ formatDate(r.date) }}</td>
              <td>{{ r.userName }}</td>
              <td><ResourceBadge :resource="r.resource" /></td>
              <td>{{ r.meterNumber }}</td>
              <td class="num">{{ formatNumber(r.prev) }}</td>
              <td class="num">{{ formatNumber(r.current) }}</td>
              <td class="num">
                {{ formatNumber(r.consumption) }} {{ RESOURCES[r.resource]?.unit }}
              </td>
              <td class="num">{{ formatMoney(r.amount) }}</td>
              <td>
                <StatusBadge :value="r.status" :dictionary="READING_STATUSES" />
                <small v-if="r.comment" class="muted comment">{{ r.comment }}</small>
              </td>
              <td>
                <div class="actions">
                  <template v-if="r.status === 'pending'">
                    <button class="btn btn--sm btn--primary" title="Принять" @click="approve(r)">
                      ✓
                    </button>
                    <button
                      class="btn btn--sm btn--secondary"
                      title="Отклонить"
                      @click="openReject(r)"
                    >
                      ✕
                    </button>
                  </template>
                  <RouterLink
                    :to="`/readings/${r.id}/edit`"
                    class="btn btn--sm btn--ghost"
                    title="Редактировать"
                  >
                    ✎
                  </RouterLink>
                  <button class="btn btn--sm btn--ghost" title="Удалить" @click="remove(r)">
                    🗑
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!filtered.length">
              <td colspan="10" class="table-empty">Показания не найдены</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <BaseModal v-if="rejecting" title="Отклонить показание" @close="rejecting = null">
      <p class="muted">
        Счётчик № {{ rejecting.meterNumber }}, {{ rejecting.userName }},
        {{ formatDate(rejecting.date) }}
      </p>
      <div class="field" style="margin-top: 1rem">
        <label for="reject-comment">Причина (будет отправлена абоненту)</label>
        <textarea
          id="reject-comment"
          v-model="rejectComment"
          class="textarea"
          rows="3"
          required
        ></textarea>
      </div>
      <div class="form-actions">
        <button class="btn btn--secondary" @click="rejecting = null">Отмена</button>
        <button class="btn btn--danger" :disabled="!rejectComment.trim()" @click="confirmReject">
          Отклонить
        </button>
      </div>
    </BaseModal>
  </section>
</template>

<style scoped>
.comment {
  display: block;
  max-width: 200px;
  font-size: 0.75rem;
}
</style>
