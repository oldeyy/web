<script setup>
// Универсальный бейдж статуса: dictionary — справочник из utils/format.js
const props = defineProps({
  value: { type: String, required: true },
  dictionary: { type: Object, required: true },
})
</script>

<template>
  <span :class="['badge', `badge--${props.dictionary[props.value]?.tone || 'muted'}`]">
    {{ props.dictionary[props.value]?.label || props.value }}
  </span>
</template>
