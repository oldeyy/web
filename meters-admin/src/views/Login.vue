<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { formatPhone, isPhoneComplete } from '@/utils/phone'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Реактивное состояние формы
const phone = ref('')
const password = ref('')
const remember = ref(true)
const showPassword = ref(false)
const touched = ref(false) // ошибки полей показываются после первой попытки отправки

const publicUrl = import.meta.env.VITE_PUBLIC_URL || '/'
const demo = import.meta.env.VITE_USE_MOCKS === 'true'

// Вычисляемые свойства пересчитываются автоматически при изменении phone и password
const phoneError = computed(() => (isPhoneComplete(phone.value) ? '' : 'Введите номер полностью'))
const passwordError = computed(() =>
  password.value.length >= 4 ? '' : 'Пароль — не менее 4 символов',
)
const isValid = computed(() => !phoneError.value && !passwordError.value)

// Пояснение, почему пользователь оказался на странице входа
const notice = computed(() => {
  if (authStore.expired) return 'Сессия истекла. Войдите снова.'
  if (route.query.redirect) return 'Для доступа к странице нужно войти.'
  return ''
})

function onPhoneInput(event) {
  phone.value = formatPhone(event.target.value)
}

async function submit() {
  touched.value = true
  if (!isValid.value) return

  if (await authStore.login(phone.value, password.value, remember.value)) {
    router.push(route.query.redirect || '/dashboard')
  }
}
</script>

<template>
  <div class="login">
    <form class="card login__card" novalidate @submit.prevent="submit">
      <img src="/logo.png" alt="" width="56" height="56" class="login__logo" />
      <h1>Вход в админ-панель</h1>
      <p class="muted">«Все счётчики» — управление показаниями</p>

      <div v-if="authStore.error" class="alert alert--error">{{ authStore.error }}</div>
      <div v-else-if="notice" class="alert alert--info">{{ notice }}</div>

      <div class="field">
        <label for="phone">Номер телефона</label>
        <input
          id="phone"
          :value="phone"
          :class="['input', { 'input--invalid': touched && phoneError }]"
          type="tel"
          inputmode="tel"
          autocomplete="username"
          placeholder="+7 (900) 000-00-01"
          autofocus
          @input="onPhoneInput"
        />
        <span v-if="touched && phoneError" class="field__error">{{ phoneError }}</span>
      </div>

      <div class="field">
        <label for="password">Пароль</label>
        <div class="password">
          <input
            id="password"
            v-model="password"
            :class="['input', { 'input--invalid': touched && passwordError }]"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
          />
          <button
            type="button"
            class="password__toggle"
            :aria-label="showPassword ? 'Скрыть пароль' : 'Показать пароль'"
            :title="showPassword ? 'Скрыть пароль' : 'Показать пароль'"
            @click="showPassword = !showPassword"
          >
            {{ showPassword ? '🙈' : '👁' }}
          </button>
        </div>
        <span v-if="touched && passwordError" class="field__error">{{ passwordError }}</span>
        <span v-if="demo" class="field__hint"
          >Демо-режим: любой телефон и пароль от 4 символов</span
        >
      </div>

      <label class="remember">
        <input v-model="remember" type="checkbox" />
        Запомнить меня на этом устройстве
      </label>

      <button type="submit" class="btn btn--primary" :disabled="authStore.loading">
        {{ authStore.loading ? 'Вход…' : 'Войти' }}
      </button>
      <a :href="publicUrl" class="login__back">← Вернуться на сайт</a>
    </form>
  </div>
</template>

<style scoped>
.login {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: linear-gradient(135deg, var(--primary-light), var(--gray-100));
}

.login__card {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
  box-shadow: var(--shadow-lg);
}

.login__card .field {
  text-align: left;
}

.login__logo {
  margin: 0 auto;
  border-radius: 12px;
}

.login__back {
  font-size: 0.9rem;
}

.input--invalid {
  border-color: var(--error);
}

.password {
  position: relative;
}

.password .input {
  padding-right: 2.75rem;
}

.password__toggle {
  position: absolute;
  top: 50%;
  right: 0.4rem;
  transform: translateY(-50%);
  border: 0;
  background: transparent;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0.25rem;
}

.remember {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: var(--gray-700);
  text-align: left;
  cursor: pointer;
}
</style>
