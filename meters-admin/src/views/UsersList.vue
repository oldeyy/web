<script setup>
import { computed, onMounted, ref } from 'vue'
import { useUsersStore } from '@/stores/users'
import StatusBadge from '@/components/StatusBadge.vue'
import BaseModal from '@/components/BaseModal.vue'
import { USER_ROLES, USER_STATUSES, formatDate } from '@/utils/format'

const store = useUsersStore()

const search = ref('')
const role = ref('')
const notifyTarget = ref(undefined) // undefined — окно закрыто, null — рассылка всем
const message = ref('')
const notice = ref('')

const filtered = computed(() =>
  store.items
    .filter((u) => !role.value || u.role === role.value)
    .filter((u) => {
      const q = search.value.trim().toLowerCase()
      return !q || u.name.toLowerCase().includes(q) || u.phone.includes(q) || u.account.includes(q)
    }),
)

onMounted(() => {
  store.fetchAll()
})

function changeRole(user, newRole) {
  store.update(user.id, { ...user, role: newRole })
}

function toggleBlock(user) {
  store.update(user.id, { ...user, status: user.status === 'active' ? 'blocked' : 'active' })
}

function openNotify(user = null) {
  notifyTarget.value = user
  message.value = 'Напоминаем: показания счётчиков принимаются с 15 по 25 число месяца.'
}

async function sendNotify() {
  await store.notify(notifyTarget.value?.id ?? null, message.value)
  notice.value = notifyTarget.value
    ? `Уведомление отправлено: ${notifyTarget.value.name}`
    : 'Рассылка отправлена всем абонентам'
  notifyTarget.value = undefined
}
</script>

<template>
  <section>
    <div class="page-header">
      <div>
        <h1>Абоненты</h1>
        <p>Пользователи сайта: роли, блокировка, уведомления</p>
      </div>
      <button class="btn btn--primary" @click="openNotify()">✉ Рассылка всем</button>
    </div>

    <div v-if="notice" class="alert alert--success" style="margin-bottom: 1rem">{{ notice }}</div>

    <div class="card">
      <div class="filters">
        <input
          v-model="search"
          class="input"
          type="search"
          placeholder="ФИО, телефон или лицевой счёт"
        />
        <select v-model="role" class="select" aria-label="Роль">
          <option value="">Все роли</option>
          <option v-for="(label, key) in USER_ROLES" :key="key" :value="key">{{ label }}</option>
        </select>
      </div>

      <p v-if="store.loading" class="muted">Загрузка…</p>
      <div v-else-if="store.error" class="alert alert--error">{{ store.error }}</div>
      <div v-else class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>ФИО</th>
              <th>Телефон</th>
              <th>Лицевой счёт</th>
              <th>Адрес</th>
              <th>Регистрация</th>
              <th>Роль</th>
              <th>Статус</th>
              <th class="num">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in filtered" :key="u.id">
              <td>
                <strong>{{ u.name }}</strong>
              </td>
              <td>{{ u.phone }}</td>
              <td>{{ u.account }}</td>
              <td>{{ u.address }}</td>
              <td>{{ formatDate(u.createdAt) }}</td>
              <td>
                <select
                  class="select select--inline"
                  :value="u.role"
                  aria-label="Роль"
                  @change="changeRole(u, $event.target.value)"
                >
                  <option v-for="(label, key) in USER_ROLES" :key="key" :value="key">
                    {{ label }}
                  </option>
                </select>
              </td>
              <td><StatusBadge :value="u.status" :dictionary="USER_STATUSES" /></td>
              <td>
                <div class="actions">
                  <button
                    class="btn btn--sm btn--ghost"
                    title="Отправить уведомление"
                    @click="openNotify(u)"
                  >
                    ✉
                  </button>
                  <button class="btn btn--sm btn--secondary" @click="toggleBlock(u)">
                    {{ u.status === 'active' ? 'Блок.' : 'Разблок.' }}
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!filtered.length">
              <td colspan="8" class="table-empty">Пользователи не найдены</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <BaseModal
      v-if="notifyTarget !== undefined"
      :title="notifyTarget ? `Уведомление: ${notifyTarget.name}` : 'Рассылка всем абонентам'"
      @close="notifyTarget = undefined"
    >
      <form @submit.prevent="sendNotify">
        <div class="field">
          <label for="message">Текст уведомления</label>
          <textarea id="message" v-model="message" class="textarea" rows="4" required></textarea>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn--secondary" @click="notifyTarget = undefined">
            Отмена
          </button>
          <button type="submit" class="btn btn--primary">Отправить</button>
        </div>
      </form>
    </BaseModal>
  </section>
</template>

<style scoped>
.select--inline {
  padding: 0.3rem 0.5rem;
  font-size: 0.85rem;
  min-width: 140px;
}
</style>
