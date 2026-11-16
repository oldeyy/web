<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppSidebar from '@/components/AppSidebar.vue'
import AppTopbar from '@/components/AppTopbar.vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Боковое меню на узких экранах выезжает поверх контента
const menuOpen = ref(false)

// После перехода на другую страницу мобильное меню закрывается
watch(
  () => route.fullPath,
  () => (menuOpen.value = false),
)

// Срок токена истёк прямо во время работы — возвращаемся на вход с последующим возвратом сюда
watch(
  () => authStore.isAuthenticated,
  (isAuthenticated) => {
    if (!isAuthenticated && authStore.expired) {
      router.push({ name: 'login', query: { redirect: route.fullPath } })
    }
  },
)
</script>

<template>
  <div class="app-layout">
    <AppSidebar :open="menuOpen" @close="menuOpen = false" />
    <div v-if="menuOpen" class="app-overlay" @click="menuOpen = false"></div>
    <div class="app-body">
      <AppTopbar @toggle-menu="menuOpen = !menuOpen" />
      <main class="app-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}

.app-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.app-content {
  flex: 1;
  padding: 1.75rem 2rem 2.5rem;
}

.app-overlay {
  display: none;
}

@media (max-width: 800px) {
  .app-content {
    padding: 1.25rem 1rem;
  }

  .app-overlay {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 40;
    background: rgb(17 24 39 / 0.45);
  }
}
</style>
