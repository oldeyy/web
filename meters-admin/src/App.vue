<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AdminLayout from '@/layouts/AdminLayout.vue'

const route = useRoute()

// Страница входа и 404 отображаются без боковой панели
const useLayout = computed(() => route.meta.layout !== 'blank')
</script>

<template>
  <AdminLayout v-if="useLayout">
    <RouterView />
  </AdminLayout>
  <RouterView v-else />
</template>
