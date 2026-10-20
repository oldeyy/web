import { createRouter, createWebHistory } from 'vue-router'

import Dashboard from '@/views/Dashboard.vue'
import ReadingsList from '@/views/ReadingsList.vue'
import ReadingForm from '@/views/ReadingForm.vue'
import MetersList from '@/views/MetersList.vue'
import UsersList from '@/views/UsersList.vue'
import TariffsList from '@/views/TariffsList.vue'
import ReceiptsList from '@/views/ReceiptsList.vue'
import Login from '@/views/Login.vue'
import NotFound from '@/views/NotFound.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
      meta: { requiresAuth: true, title: 'Дашборд' },
    },
    {
      path: '/readings',
      name: 'readings',
      component: ReadingsList,
      meta: { requiresAuth: true, title: 'Показания' },
    },
    {
      path: '/readings/create',
      name: 'reading-create',
      component: ReadingForm,
      meta: { requiresAuth: true, title: 'Новое показание' },
    },
    {
      path: '/readings/:id/edit',
      name: 'reading-edit',
      component: ReadingForm,
      props: true,
      meta: { requiresAuth: true, title: 'Редактирование показания' },
    },
    {
      path: '/meters',
      name: 'meters',
      component: MetersList,
      meta: { requiresAuth: true, title: 'Счётчики' },
    },
    {
      path: '/users',
      name: 'users',
      component: UsersList,
      meta: { requiresAuth: true, title: 'Абоненты' },
    },
    {
      path: '/tariffs',
      name: 'tariffs',
      component: TariffsList,
      meta: { requiresAuth: true, title: 'Тарифы' },
    },
    {
      path: '/receipts',
      name: 'receipts',
      component: ReceiptsList,
      meta: { requiresAuth: true, title: 'Квитанции' },
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { layout: 'blank', title: 'Вход' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFound,
      meta: { layout: 'blank', title: 'Страница не найдена' },
    },
  ],
})

router.beforeEach((to) => {
  const isAuthenticated = Boolean(localStorage.getItem('accessToken'))

  if (to.meta.requiresAuth && !isAuthenticated) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    }
  }

  if (to.name === 'login' && isAuthenticated) {
    return { name: 'dashboard' }
  }
})

router.afterEach((to) => {
  document.title = `${to.meta.title ? to.meta.title + ' — ' : ''}Админ-панель «Все счётчики»`
})

export default router
