<template>
  <div class="not-found">
    <p class="not-found__code">404</p>
    <h1>Страница не найдена</h1>
    <RouterLink to="/dashboard" class="btn btn--primary">На дашборд</RouterLink>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.not-found__code {
  font-size: 5rem;
  font-weight: 800;
  color: var(--primary);
  line-height: 1;
}
</style>
