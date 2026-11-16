<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { USER_ROLES } from '@/utils/format'

const route = useRoute()
const authStore = useAuthStore()

defineEmits(['toggle-menu'])

const title = computed(() => route.meta.title || '')

// Время окончания сессии из поля exp токена
const sessionUntil = computed(() =>
  authStore.expiresAt
    ? new Date(authStore.expiresAt).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '',
)
const demo = import.meta.env.VITE_USE_MOCKS === 'true'
</script>

<template>
  <header class="topbar">
    <button
      type="button"
      class="topbar__menu"
      aria-label="Открыть меню"
      @click="$emit('toggle-menu')"
    >
      ☰
    </button>
    <span class="topbar__crumbs"
      >Админ-панель / <strong>{{ title }}</strong></span
    >
    <span v-if="demo" class="badge badge--warning" title="Данные обслуживает mock-адаптер">
      демо-данные
    </span>
    <span v-if="sessionUntil" class="topbar__session" title="Срок действия токена доступа">
      Сессия до {{ sessionUntil }}{{ authStore.remember ? '' : ' · до закрытия вкладки' }}
    </span>
    <div class="topbar__user">
      <span class="topbar__avatar" aria-hidden="true">{{ authStore.user?.name?.[0] || 'A' }}</span>
      <span>
        {{ authStore.user?.name || 'Гость' }}
        <small>{{ USER_ROLES[authStore.user?.role] || '' }}</small>
      </span>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.85rem 2rem;
  background: #fff;
  border-bottom: 1px solid var(--gray-200);
}

.topbar__crumbs {
  margin-right: auto;
  color: var(--gray-500);
  font-size: 0.9rem;
}

.topbar__crumbs strong {
  color: var(--gray-900);
  font-weight: 600;
}

.topbar__menu {
  display: none;
  border: 0;
  background: transparent;
  font-size: 1.4rem;
  line-height: 1;
  cursor: pointer;
  color: var(--gray-700);
}

.topbar__session {
  font-size: 0.8rem;
  color: var(--gray-500);
}

.topbar__user {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.9rem;
  line-height: 1.2;
}

.topbar__user small {
  display: block;
  color: var(--gray-500);
}

.topbar__avatar {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--primary-light);
  color: var(--primary-dark);
  font-weight: 700;
}

@media (max-width: 800px) {
  .topbar {
    padding: 0.75rem 1rem;
  }

  .topbar__menu {
    display: block;
  }

  .topbar__session,
  .topbar__crumbs {
    display: none;
  }

  .topbar__user {
    margin-left: auto;
  }
}
</style>
