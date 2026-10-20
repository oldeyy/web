<script setup>
import { onMounted, ref } from 'vue'
import { useTariffsStore } from '@/stores/tariffs'
import ResourceBadge from '@/components/ResourceBadge.vue'
import BaseModal from '@/components/BaseModal.vue'
import { RESOURCES, formatDate, formatMoney } from '@/utils/format'

const store = useTariffsStore()
const editing = ref(null)

onMounted(() => {
  store.fetchAll()
})

function openForm(tariff = null) {
  editing.value = tariff
    ? { ...tariff, validTo: tariff.validTo || '' }
    : { resource: 'electricity', name: '', price: '', validFrom: '', validTo: '' }
}

async function save() {
  const { id, resource, name, price, validFrom, validTo } = editing.value
  const payload = {
    resource,
    name,
    price: Number(price),
    unit: RESOURCES[resource].unit,
    validFrom,
    validTo: validTo || null,
  }
  if (id) await store.update(id, payload)
  else await store.create(payload)
  editing.value = null
}

function remove(tariff) {
  if (confirm(`Удалить тариф «${tariff.name}»?`)) store.remove(tariff.id)
}
</script>

<template>
  <section>
    <div class="page-header">
      <div>
        <h1>Тарифы</h1>
        <p>Стоимость единицы ресурса для расчёта сумм к оплате</p>
      </div>
      <button class="btn btn--primary" @click="openForm()">+ Добавить тариф</button>
    </div>

    <div class="card">
      <p v-if="store.loading" class="muted">Загрузка…</p>
      <div v-else-if="store.error" class="alert alert--error">{{ store.error }}</div>
      <div v-else class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Ресурс</th>
              <th>Наименование</th>
              <th class="num">Цена</th>
              <th>Действует с</th>
              <th>Действует по</th>
              <th>Состояние</th>
              <th class="num">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in store.items" :key="t.id">
              <td><ResourceBadge :resource="t.resource" /></td>
              <td>{{ t.name }}</td>
              <td class="num">
                <strong>{{ formatMoney(t.price) }}</strong> / {{ t.unit }}
              </td>
              <td>{{ formatDate(t.validFrom) }}</td>
              <td>{{ t.validTo ? formatDate(t.validTo) : 'бессрочно' }}</td>
              <td>
                <span :class="['badge', t.validTo ? 'badge--muted' : 'badge--success']">
                  {{ t.validTo ? 'Архивный' : 'Действующий' }}
                </span>
              </td>
              <td>
                <div class="actions">
                  <button class="btn btn--sm btn--ghost" title="Редактировать" @click="openForm(t)">
                    ✎
                  </button>
                  <button class="btn btn--sm btn--ghost" title="Удалить" @click="remove(t)">
                    🗑
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <BaseModal
      v-if="editing"
      :title="editing.id ? 'Редактирование тарифа' : 'Новый тариф'"
      @close="editing = null"
    >
      <form @submit.prevent="save">
        <div class="form-grid">
          <div class="field">
            <label for="t-resource">Ресурс</label>
            <select id="t-resource" v-model="editing.resource" class="select">
              <option v-for="(r, key) in RESOURCES" :key="key" :value="key">{{ r.label }}</option>
            </select>
          </div>
          <div class="field">
            <label for="t-price">Цена, ₽ / {{ RESOURCES[editing.resource].unit }}</label>
            <input
              id="t-price"
              v-model="editing.price"
              class="input"
              type="number"
              step="0.01"
              min="0"
              required
            />
          </div>
          <div class="field" style="grid-column: 1 / -1">
            <label for="t-name">Наименование</label>
            <input id="t-name" v-model="editing.name" class="input" required />
          </div>
          <div class="field">
            <label for="t-from">Действует с</label>
            <input id="t-from" v-model="editing.validFrom" class="input" type="date" required />
          </div>
          <div class="field">
            <label for="t-to">Действует по</label>
            <input id="t-to" v-model="editing.validTo" class="input" type="date" />
            <span class="field__hint">Пусто — тариф действующий</span>
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
