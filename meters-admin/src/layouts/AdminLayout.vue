<script setup>
import AppSidebar from '@/components/AppSidebar.vue'
import AppTopbar from '@/components/AppTopbar.vue'
</script>

<template>
  <div class="app-layout">
    <AppSidebar />
    <div class="app-body">
      <AppTopbar />
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

@media (max-width: 800px) {
  .app-layout {
    flex-direction: column;
  }

  .app-content {
    padding: 1.25rem 1rem;
  }
}
</style>
