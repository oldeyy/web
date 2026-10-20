<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  icon: { type: String, default: '' },
  tone: { type: String, default: 'primary' },
  hint: { type: String, default: '' },
})
</script>

<template>
  <article class="card stat">
    <span :class="['stat__icon', `stat__icon--${tone}`]" aria-hidden="true">{{ icon }}</span>
    <div>
      <p class="stat__label">{{ label }}</p>
      <p class="stat__value">{{ value }}</p>
      <p v-if="hint" class="stat__hint">{{ hint }}</p>
    </div>
  </article>
</template>

<style scoped>
.stat {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat__icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 46px;
  height: 46px;
  border-radius: var(--radius-md);
  font-size: 1.3rem;
}

.stat__icon--primary {
  background: var(--primary-light);
  color: var(--primary);
}
.stat__icon--success {
  background: var(--success-light);
  color: var(--success);
}
.stat__icon--warning {
  background: var(--warning-light);
  color: var(--warning);
}
.stat__icon--error {
  background: var(--error-light);
  color: var(--error);
}

.stat__label {
  font-size: 0.85rem;
  color: var(--gray-500);
}

.stat__value {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
}

.stat__hint {
  font-size: 0.78rem;
  color: var(--gray-500);
}
</style>
