import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { setUnauthorizedHandler } from './services/api'
import { useAuthStore } from './stores/auth'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Сервер отклонил токен (истёк, отозван, пользователь заблокирован):
// завершаем сессию и открываем страницу входа с возвратом на текущую страницу
setUnauthorizedHandler(() => {
  const authStore = useAuthStore()
  authStore.expire()
  const current = router.currentRoute.value
  if (current.name !== 'login') {
    router.push({ name: 'login', query: { redirect: current.fullPath } })
  }
})

app.mount('#app')
