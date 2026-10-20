<script setup>
import { RESOURCES } from '@/utils/format'

defineProps({ resource: { type: String, required: true } })
</script>

<template>
  <span :class="['badge', `badge--${resource}`]">{{ RESOURCES[resource]?.label || resource }}</span>
</template>
