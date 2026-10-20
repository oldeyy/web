<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const publicUrl = import.meta.env.VITE_PUBLIC_URL || '/'

const links = [
  { to: '/dashboard', label: 'Дашборд', icon: '▦' },
  { to: '/readings', label: 'Показания', icon: '✎' },
  { to: '/meters', label: 'Счётчики', icon: '⏲' },
  { to: '/users', label: 'Абоненты', icon: '☺' },
  { to: '/tariffs', label: 'Тарифы', icon: '₽' },
  { to: '/receipts', label: 'Квитанции', icon: '▤' },
]

function logout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar__inner">
      <RouterLink to="/dashboard" class="sidebar__logo">
        <img src="/logo.png" alt="" width="32" height="32" />
        <span>Все счётчики<small>Админ-панель</small></span>
      </RouterLink>

      <nav class="sidebar__nav" aria-label="Разделы админ-панели">
        <RouterLink v-for="link in links" :key="link.to" :to="link.to" class="sidebar__link">
          <span class="sidebar__icon" aria-hidden="true">{{ link.icon }}</span>
          {{ link.label }}
        </RouterLink>
      </nav>

      <div class="sidebar__footer">
        <a :href="publicUrl" class="sidebar__site" target="_blank" rel="noopener"
          >↗ Публичный сайт</a
        >
        <button
          v-if="authStore.isAuthenticated"
          type="button"
          class="sidebar__logout"
          @click="logout"
        >
          Выйти
        </button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  flex-shrink: 0;
  width: 240px;
  background: var(--gray-900);
  color: #fff;
}

/* Внутренний блок «прилипает» к верху окна при прокрутке длинных страниц */
.sidebar__inner {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 1.25rem 0.9rem;
  position: sticky;
  top: 0;
}

.sidebar__logo {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0 0.5rem 1.5rem;
  color: #fff;
  font-weight: 700;
}

.sidebar__logo img {
  border-radius: 8px;
  background: #fff;
}

.sidebar__logo small {
  display: block;
  font-size: 0.72rem;
  font-weight: 400;
  color: var(--gray-400);
}

.sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.sidebar__link {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.65rem 0.8rem;
  border-radius: var(--radius-md);
  color: var(--gray-300);
  transition:
    background-color 0.2s,
    color 0.2s;
}

.sidebar__icon {
  width: 1.25rem;
  text-align: center;
}

.sidebar__link:hover {
  background: var(--gray-800);
  color: #fff;
}

.sidebar__link.router-link-active {
  background: var(--primary);
  color: #fff;
}

.sidebar__footer {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.sidebar__site {
  padding: 0 0.8rem;
  font-size: 0.85rem;
  color: var(--gray-400);
}

.sidebar__logout {
  padding: 0.6rem 0.8rem;
  border: 0;
  border-radius: var(--radius-md);
  background: var(--error);
  color: #fff;
  font: inherit;
  cursor: pointer;
}

.sidebar__logout:hover {
  background: #b91c1c;
}

@media (max-width: 800px) {
  .sidebar {
    width: 100%;
  }

  .sidebar__inner {
    height: auto;
    position: static;
  }

  .sidebar__nav {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .sidebar__footer {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-top: 1rem;
  }
}
</style>
