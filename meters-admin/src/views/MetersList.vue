<script setup>
import { computed, onMounted, ref } from 'vue'
import { useMetersStore } from '@/stores/meters'
import { useUsersStore } from '@/stores/users'
import ResourceBadge from '@/components/ResourceBadge.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import BaseModal from '@/components/BaseModal.vue'
import { RESOURCES, METER_STATUSES, formatDate } from '@/utils/format'

const store = useMetersStore()
const usersStore = useUsersStore()

const search = ref('')
const resource = ref('')
const editing = ref(null) // редактируемая запись (null — модальное окно закрыто)

const abonents = computed(() => usersStore.items.filter((u) => u.role === 'abonent'))

const filtered = computed(() =>
  store.items
    .filter((m) => !resource.value || m.resource === resource.value)
    .filter((m) => {
      const q = search.value.trim().toLowerCase()
      return !q || m.number.includes(q) || m.userName?.toLowerCase().includes(q)
    }),
)

onMounted(() => {
  store.fetchAll()
  usersStore.fetchAll()
})

function openForm(meter = null) {
  editing.value = meter
    ? { ...meter }
    : {
        number: '',
        resource: 'water',
        userId: '',
        installedAt: '',
        verifiedUntil: '',
        status: 'active',
      }
}

async function save() {
  const { id, number, resource, userId, installedAt, verifiedUntil, status } = editing.value
  const payload = { number, resource, userId: Number(userId), installedAt, verifiedUntil, status }
  if (id) await store.update(id, payload)
  else await store.create(payload)
  editing.value = null
}

function remove(meter) {
  if (confirm(`Удалить счётчик № ${meter.number}?`)) store.remove(meter.id)
}
</script>

<template>
  <section>
    <div class="page-header">
      <div>
        <h1>Счётчики</h1>
        <p>Приборы учёта абонентов и сроки их поверки</p>
      </div>
      <button class="btn btn--primary" @click="openForm()">+ Добавить счётчик</button>
    </div>

    <div class="card">
      <div class="filters">
        <input v-model="search" class="input" type="search" placeholder="№ счётчика или абонент" />
        <select v-model="resource" class="select" aria-label="Ресурс">
          <option value="">Все ресурсы</option>
          <option v-for="(r, key) in RESOURCES" :key="key" :value="key">{{ r.label }}</option>
        </select>
      </div>

      <p v-if="store.loading" class="muted">Загрузка…</p>
      <div v-else-if="store.error" class="alert alert--error">{{ store.error }}</div>
      <div v-else class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>№ счётчика</th>
              <th>Ресурс</th>
              <th>Абонент</th>
              <th>Адрес</th>
              <th>Установлен</th>
              <th>Поверка до</th>
              <th>Статус</th>
              <th class="num">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in filtered" :key="m.id">
              <td>
                <strong>{{ m.number }}</strong>
              </td>
              <td><ResourceBadge :resource="m.resource" /></td>
              <td>{{ m.userName }}</td>
              <td>{{ m.address }}</td>
              <td>{{ formatDate(m.installedAt) }}</td>
              <td>{{ formatDate(m.verifiedUntil) }}</td>
              <td><StatusBadge :value="m.status" :dictionary="METER_STATUSES" /></td>
              <td>
                <div class="actions">
                  <button class="btn btn--sm btn--ghost" title="Редактировать" @click="openForm(m)">
                    ✎
                  </button>
                  <button class="btn btn--sm btn--ghost" title="Удалить" @click="remove(m)">
                    🗑
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!filtered.length">
              <td colspan="8" class="table-empty">Счётчики не найдены</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <BaseModal
      v-if="editing"
      :title="editing.id ? `Счётчик № ${editing.number}` : 'Новый счётчик'"
      @close="editing = null"
    >
      <form @submit.prevent="save">
        <div class="form-grid">
          <div class="field">
            <label for="m-number">Заводской номер</label>
            <input id="m-number" v-model="editing.number" class="input" required pattern="\d{5,}" />
          </div>
          <div class="field">
            <label for="m-resource">Ресурс</label>
            <select id="m-resource" v-model="editing.resource" class="select">
              <option v-for="(r, key) in RESOURCES" :key="key" :value="key">{{ r.label }}</option>
            </select>
          </div>
          <div class="field">
            <label for="m-user">Абонент</label>
            <select id="m-user" v-model="editing.userId" class="select" required>
              <option value="" disabled>Выберите абонента</option>
              <option v-for="u in abonents" :key="u.id" :value="u.id">
                {{ u.name }} (л/с {{ u.account }})
              </option>
            </select>
          </div>
          <div class="field">
            <label for="m-status">Статус</label>
            <select id="m-status" v-model="editing.status" class="select">
              <option v-for="(s, key) in METER_STATUSES" :key="key" :value="key">
                {{ s.label }}
              </option>
            </select>
          </div>
          <div class="field">
            <label for="m-installed">Дата установки</label>
            <input
              id="m-installed"
              v-model="editing.installedAt"
              class="input"
              type="date"
              required
            />
          </div>
          <div class="field">
            <label for="m-verified">Поверка действительна до</label>
            <input
              id="m-verified"
              v-model="editing.verifiedUntil"
              class="input"
              type="date"
              required
            />
          </div>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn--secondary" @click="editing = null">Отмена</button>
          <button type="submit" class="btn btn--primary">Сохранить</button>
        </div>
      </form>
    </BaseModal>
  </section>
</template>
