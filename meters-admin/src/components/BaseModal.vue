<script setup>
defineProps({ title: { type: String, required: true } })
const emit = defineEmits(['close'])
</script>

<template>
  <div
    class="modal"
    role="dialog"
    aria-modal="true"
    :aria-label="title"
    @click.self="emit('close')"
  >
    <div class="modal__box card">
      <div class="card__header">
        <h2>{{ title }}</h2>
        <button
          type="button"
          class="btn btn--ghost btn--sm"
          aria-label="Закрыть"
          @click="emit('close')"
        >
          ✕
        </button>
      </div>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgb(17 24 39 / 0.45);
}

.modal__box {
  width: 100%;
  max-width: 560px;
  box-shadow: var(--shadow-lg);
}
</style>
