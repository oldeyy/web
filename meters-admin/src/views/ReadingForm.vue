<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useReadingsStore } from '@/stores/readings'
import { useMetersStore } from '@/stores/meters'
import { useTariffsStore } from '@/stores/tariffs'
import { RESOURCES, READING_STATUSES, formatMoney, formatNumber } from '@/utils/format'

const props = defineProps({ id: { type: String, default: null } })

const router = useRouter()
const readingsStore = useReadingsStore()
const metersStore = useMetersStore()
const tariffsStore = useTariffsStore()

const isEdit = computed(() => Boolean(props.id))
const saving = ref(false)
const error = ref(null)

const form = reactive({
  meterId: '',
  date: new Date().toISOString().slice(0, 10),
  prev: 0,
  current: '',
  tariff: 0,
  responsible: '',
  status: 'approved',
  comment: '',
})

const meter = computed(() => metersStore.items.find((m) => m.id === Number(form.meterId)))
const unit = computed(() => RESOURCES[meter.value?.resource]?.unit || '')
const consumption = computed(() => Math.max(Number(form.current) - Number(form.prev), 0))
const amount = computed(() => consumption.value * Number(form.tariff))
const currentInvalid = computed(
  () => form.current !== '' && Number(form.current) < Number(form.prev),
)

// При выборе счётчика подставляем действующий тариф и последние показания
watch(
  () => form.meterId,
  async (meterId, oldId) => {
    if (!meter.value || (isEdit.value && !oldId)) return
    const tariff = tariffsStore.items.find((t) => t.resource === meter.value.resource && !t.validTo)
    form.tariff = tariff?.price ?? 0
    if (!readingsStore.items.length) await readingsStore.fetchAll()
    const last = readingsStore.items
      .filter((r) => r.meterId === Number(meterId) && r.status === 'approved')
      .sort((a, b) => b.date.localeCompare(a.date))[0]
    form.prev = last?.current ?? 0
    form.responsible = meter.value.userName || ''
  },
)

onMounted(async () => {
  await Promise.all([metersStore.fetchAll(), tariffsStore.fetchAll()])
  if (isEdit.value) {
    const reading = await readingsStore.fetchOne(props.id)
    Object.assign(form, reading)
  }
})

async function save() {
  if (currentInvalid.value) return
  saving.value = true
  error.value = null

  const payload = {
    meterId: Number(form.meterId),
    date: form.date,
    prev: Number(form.prev),
    current: Number(form.current),
    tariff: Number(form.tariff),
    responsible: form.responsible,
    status: form.status,
    comment: form.comment,
  }

  try {
    if (isEdit.value) {
      await readingsStore.update(props.id, payload)
    } else {
      await readingsStore.create(payload)
    }
    router.push('/readings')
  } catch (err) {
    error.value = err.response?.data?.message || 'Не удалось сохранить показание'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section>
    <div class="page-header">
      <div>
        <h1>{{ isEdit ? `Показание № ${id}` : 'Новое показание' }}</h1>
        <p>{{ isEdit ? 'Корректировка переданных данных' : 'Ввод показаний за абонента' }}</p>
      </div>
      <RouterLink to="/readings" class="btn btn--secondary">← К списку</RouterLink>
    </div>

    <form class="card" @submit.prevent="save">
      <div v-if="error" class="alert alert--error" style="margin-bottom: 1rem">{{ error }}</div>

      <div class="form-grid">
        <div class="field">
          <label for="meter">Счётчик</label>
          <select id="meter" v-model="form.meterId" class="select" required>
            <option value="" disabled>Выберите счётчик</option>
            <option v-for="m in metersStore.items" :key="m.id" :value="m.id">
              № {{ m.number }} — {{ RESOURCES[m.resource].label }} ({{ m.userName }})
            </option>
          </select>
        </div>
        <div class="field">
          <label for="date">Дата снятия</label>
          <input id="date" v-model="form.date" class="input" type="date" required />
        </div>
        <div class="field">
          <label for="prev">Предыдущие показания{{ unit && `, ${unit}` }}</label>
          <input
            id="prev"
            v-model="form.prev"
            class="input"
            type="number"
            step="0.001"
            min="0"
            required
          />
          <span class="field__hint">Подставляются из последнего принятого показания</span>
        </div>
        <div class="field">
          <label for="current">Текущие показания{{ unit && `, ${unit}` }}</label>
          <input
            id="current"
            v-model="form.current"
            class="input"
            type="number"
            step="0.001"
            min="0"
            required
          />
          <span v-if="currentInvalid" class="field__error">
            Текущие показания не могут быть меньше предыдущих
          </span>
        </div>
        <div class="field">
          <label for="tariff">Тариф, ₽{{ unit && ` / ${unit}` }}</label>
          <input
            id="tariff"
            v-model="form.tariff"
            class="input"
            type="number"
            step="0.01"
            min="0"
            required
          />
        </div>
        <div class="field">
          <label for="responsible">Ответственный за снятие</label>
          <input id="responsible" v-model="form.responsible" class="input" type="text" required />
        </div>
        <div class="field">
          <label for="status">Статус</label>
          <select id="status" v-model="form.status" class="select">
            <option v-for="(s, key) in READING_STATUSES" :key="key" :value="key">
              {{ s.label }}
            </option>
          </select>
        </div>
        <div class="field">
          <label for="comment">Комментарий</label>
          <input id="comment" v-model="form.comment" class="input" type="text" />
        </div>
      </div>

      <div class="alert alert--info summary">
        Расход: <strong>{{ formatNumber(consumption) }} {{ unit }}</strong> · К оплате:
        <strong>{{ formatMoney(amount) }}</strong>
      </div>

      <div class="form-actions">
        <RouterLink to="/readings" class="btn btn--secondary">Отмена</RouterLink>
        <button type="submit" class="btn btn--primary" :disabled="saving || currentInvalid">
          {{ saving ? 'Сохранение…' : 'Сохранить' }}
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped>
.summary {
  margin-top: 1.25rem;
}
</style>
