<script setup>
import { computed } from 'vue'

/** Линейный график без внешних библиотек: points — массив { date, count }. */
const props = defineProps({
  points: { type: Array, required: true },
  height: { type: Number, default: 220 },
})

const WIDTH = 640
const PAD = { top: 16, right: 12, bottom: 28, left: 36 }

const max = computed(() => Math.ceil(Math.max(...props.points.map((p) => p.count), 1) / 20) * 20)

const coords = computed(() => {
  const w = WIDTH - PAD.left - PAD.right
  const h = props.height - PAD.top - PAD.bottom
  const step = props.points.length > 1 ? w / (props.points.length - 1) : 0
  return props.points.map((p, i) => ({
    x: PAD.left + i * step,
    y: PAD.top + h - (p.count / max.value) * h,
    label: p.date.slice(8, 10) + '.' + p.date.slice(5, 7),
    count: p.count,
  }))
})

const line = computed(() => coords.value.map((c) => `${c.x},${c.y}`).join(' '))
const area = computed(() => {
  const base = props.height - PAD.bottom
  const first = coords.value[0]
  const last = coords.value[coords.value.length - 1]
  return first ? `${first.x},${base} ${line.value} ${last.x},${base}` : ''
})

const gridLines = computed(() =>
  [0, 0.25, 0.5, 0.75, 1].map((k) => ({
    y: PAD.top + (props.height - PAD.top - PAD.bottom) * (1 - k),
    value: Math.round(max.value * k),
  })),
)
</script>

<template>
  <svg
    :viewBox="`0 0 ${WIDTH} ${height}`"
    class="chart"
    role="img"
    aria-label="Количество переданных показаний по дням"
  >
    <g v-for="g in gridLines" :key="g.y">
      <line :x1="PAD.left" :x2="WIDTH - PAD.right" :y1="g.y" :y2="g.y" class="chart__grid" />
      <text :x="PAD.left - 6" :y="g.y + 4" text-anchor="end" class="chart__axis">
        {{ g.value }}
      </text>
    </g>
    <polygon :points="area" class="chart__area" />
    <polyline :points="line" class="chart__line" />
    <g v-for="(c, i) in coords" :key="i">
      <circle :cx="c.x" :cy="c.y" r="3.5" class="chart__dot">
        <title>{{ c.label }}: {{ c.count }}</title>
      </circle>
      <text v-if="i % 2 === 0" :x="c.x" :y="height - 8" text-anchor="middle" class="chart__axis">
        {{ c.label }}
      </text>
    </g>
  </svg>
</template>

<style scoped>
.chart {
  width: 100%;
  height: auto;
  display: block;
}

.chart__grid {
  stroke: var(--gray-200);
}

.chart__axis {
  font-size: 11px;
  fill: var(--gray-500);
}

.chart__line {
  fill: none;
  stroke: var(--primary);
  stroke-width: 2.5;
  stroke-linejoin: round;
}

.chart__area {
  fill: var(--primary-light);
  opacity: 0.6;
}

.chart__dot {
  fill: #fff;
  stroke: var(--primary);
  stroke-width: 2;
}
</style>
