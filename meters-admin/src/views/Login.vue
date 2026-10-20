<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const phone = ref('')
const password = ref('')
const publicUrl = import.meta.env.VITE_PUBLIC_URL || '/'

async function submit() {
  if (await authStore.login(phone.value, password.value)) {
    router.push(route.query.redirect || '/dashboard')
  }
}
</script>

<template>
  <div class="login">
    <form class="card login__card" @submit.prevent="submit">
      <img src="/logo.png" alt="" width="56" height="56" class="login__logo" />
      <h1>Вход в админ-панель</h1>
      <p class="muted">«Все счётчики» — управление показаниями</p>

      <div v-if="authStore.error" class="alert alert--error">{{ authStore.error }}</div>

      <div class="field">
        <label for="phone">Номер телефона</label>
        <input
          id="phone"
          v-model="phone"
          class="input"
          type="tel"
          placeholder="+7 900 000-00-01"
          required
        />
      </div>
      <div class="field">
        <label for="password">Пароль</label>
        <input id="password" v-model="password" class="input" type="password" required />
        <span class="field__hint">Демо-режим: любой телефон и пароль от 4 символов</span>
      </div>

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
</style>
