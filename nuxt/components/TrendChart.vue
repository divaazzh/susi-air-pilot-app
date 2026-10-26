<template>
  <div class="trend-chart-card">
    <div class="chart-header">
      <div class="chart-title-area">
        <h3 class="chart-title">Flight Hours Trend</h3>
        <p class="chart-subtitle">Centered on 15 May 2026 (±7 Days)</p>
      </div>

      <!-- Range Toggles -->
      <div class="range-toggles">
        <button
          v-for="r in ranges"
          :key="r"
          type="button"
          class="range-btn"
          :class="{ active: activeRange === r }"
          @click="selectRange(r)"
        >
          {{ r }}
        </button>
      </div>
    </div>

    <!-- Chart Canvas / SVG -->
    <div class="chart-viewport">
      <svg class="chart-svg" viewBox="0 0 380 200" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#22C5E8" stop-opacity="0.38" />
            <stop offset="100%" stop-color="#22C5E8" stop-opacity="0.0" />
          </linearGradient>
        </defs>

        <!-- Horizontal Guide lines -->
        <line x1="30" y1="20" x2="370" y2="20" stroke="#E2E8F0" stroke-dasharray="3,3" stroke-width="1" />
        <line x1="30" y1="75" x2="370" y2="75" stroke="#E2E8F0" stroke-dasharray="3,3" stroke-width="1" />
        <line x1="30" y1="130" x2="370" y2="130" stroke="#E2E8F0" stroke-dasharray="3,3" stroke-width="1" />
        <line x1="30" y1="170" x2="370" y2="170" stroke="#CBD5E1" stroke-width="1.5" />

        <!-- Red Limit Line -->
        <line
          v-if="limitY !== null"
          x1="30"
          :y1="limitY"
          x2="370"
          :y2="limitY"
          stroke="#E63757"
          stroke-width="1.8"
          stroke-dasharray="5,3"
        />
        <text
          v-if="limitY !== null"
          x="368"
          :y="Math.max(14, limitY - 4)"
          text-anchor="end"
          class="limit-label"
        >
          LIMIT {{ limit }}h
        </text>

        <!-- Area Fill -->
        <polygon v-if="areaPoints" :points="areaPoints" fill="url(#chartGradient)" />

        <!-- Line Path -->
        <polyline
          v-if="polylinePoints"
          :points="polylinePoints"
          fill="none"
          stroke="#0284C7"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <!-- Data Points & Today Highlight -->
        <g v-for="(p, idx) in mappedPoints" :key="idx">
          <!-- Today vertical indicator line -->
          <line
            v-if="p.isToday"
            :x1="p.x"
            y1="20"
            :x2="p.x"
            y2="170"
            stroke="#0E2138"
            stroke-width="1.2"
            stroke-dasharray="2,2"
          />

          <!-- Circle Point -->
          <circle
            :cx="p.x"
            :cy="p.y"
            :r="p.isToday ? 5 : 3"
            :fill="p.isToday ? '#E63757' : '#0284C7'"
            stroke="#FFFFFF"
            stroke-width="1.5"
          />

          <!-- Value on top of Today point -->
          <text
            v-if="p.isToday"
            :x="p.x"
            :y="Math.max(16, p.y - 8)"
            text-anchor="middle"
            class="today-value-label"
          >
            {{ p.rollingSum }}h
          </text>
        </g>

        <!-- X-Axis Labels (first, middle/today, last) -->
        <text x="35" y="188" text-anchor="start" class="axis-label">{{ formattedDates[0] }}</text>
        <text x="200" y="188" text-anchor="middle" class="axis-label today-axis-label">Today (15 May)</text>
        <text x="365" y="188" text-anchor="end" class="axis-label">{{ formattedDates[formattedDates.length - 1] }}</text>

        <!-- Y-Axis Scale Markers -->
        <text x="25" y="24" text-anchor="end" class="axis-label">{{ maxY }}h</text>
        <text x="25" y="100" text-anchor="end" class="axis-label">{{ Math.round(maxY / 2) }}h</text>
        <text x="25" y="174" text-anchor="end" class="axis-label">0h</text>
      </svg>
    </div>

    <!-- Chart Legend Footer -->
    <div class="chart-footer">
      <div class="legend-indicator">
        <span class="dot line-dot"></span>
        <span class="legend-text">Rolling Sum ({{ activeRange }})</span>
      </div>
      <div class="legend-indicator">
        <span class="dot limit-dot"></span>
        <span class="legend-text">Regulatory Cap ({{ limit }}h)</span>
      </div>
      <div class="legend-indicator">
        <span class="dot today-dot"></span>
        <span class="legend-text">15 May Today</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  activeRange: string;
  limit: number;
  maxY: number;
  chartData: Array<{
    date: string;
    rollingSum: number;
    dailyHours: number;
    isToday: boolean;
  }>;
}>();

const emit = defineEmits<{(e: 'update:range', val: string): void }>();

const ranges = ['1w', '1m', '3m', '6m', '1y'];

function selectRange(r: string) {
  emit('update:range', r);
}

// Chart layout metrics
const svgWidth = 380;
const svgHeight = 200;
const paddingX = 35;
const rightPadding = 15;
const plotWidth = svgWidth - paddingX - rightPadding; // 330px
const plotTop = 20;
const plotBottom = 170;
const plotHeight = plotBottom - plotTop; // 150px

const limitY = computed(() => {
  if (!props.maxY || props.limit === undefined) return null;
  // Clamped so it doesn't render off-canvas
  const ratio = Math.min(1.2, props.limit / props.maxY);
  return plotBottom - ratio * plotHeight;
});

const mappedPoints = computed(() => {
  const points = props.chartData || [];
  if (points.length === 0) return [];

  const stepX = plotWidth / (points.length - 1);
  const effectiveMax = Math.max(props.maxY || 45, ...points.map((p) => p.rollingSum));

  return points.map((p, idx) => {
    const x = paddingX + idx * stepX;
    const ratio = Math.max(0, p.rollingSum / effectiveMax);
    const y = plotBottom - ratio * plotHeight;
    return {
      ...p,
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
    };
  });
});

const polylinePoints = computed(() => {
  return mappedPoints.value.map((p) => `${p.x},${p.y}`).join(' ');
});

const areaPoints = computed(() => {
  if (mappedPoints.value.length === 0) return '';
  const first = mappedPoints.value[0];
  const last = mappedPoints.value[mappedPoints.value.length - 1];
  const line = mappedPoints.value.map((p) => `${p.x},${p.y}`).join(' ');
  return `${first.x},${plotBottom} ${line} ${last.x},${plotBottom}`;
});

const formattedDates = computed(() => {
  return (props.chartData || []).map((d) => {
    const parts = d.date.split('-');
    if (parts.length === 3) {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${parseInt(parts[2], 10)} ${monthNames[parseInt(parts[1], 10) - 1]}`;
    }
    return d.date;
  });
});
</script>

<style scoped lang="scss">
.trend-chart-card {
  background-color: var(--color-card);
  border-radius: var(--radius-lg);
  padding: 16px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 8px;
}

.chart-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-primary-navy);
}

.chart-subtitle {
  font-size: 11px;
  color: var(--color-text-secondary);
  margin-top: 1px;
}

.range-toggles {
  display: flex;
  background-color: #F1F5F9;
  padding: 2px;
  border-radius: var(--radius-sm);
  gap: 2px;
}

.range-btn {
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 700;
  border-radius: 6px;
  color: var(--color-text-secondary);
  transition: all 0.15s ease;

  &.active {
    background-color: var(--color-primary-navy);
    color: #FFFFFF;
    box-shadow: 0 1px 3px rgba(14, 33, 56, 0.2);
  }

  &:hover:not(.active) {
    color: var(--color-primary-navy);
  }
}

.chart-viewport {
  width: 100%;
  height: 200px;
  position: relative;
}

.chart-svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.limit-label {
  font-size: 9px;
  font-weight: 800;
  fill: var(--color-brand-red);
}

.axis-label {
  font-size: 9px;
  font-weight: 600;
  fill: var(--color-text-muted);
}

.today-axis-label {
  fill: var(--color-primary-navy);
  font-weight: 700;
}

.today-value-label {
  font-size: 10px;
  font-weight: 800;
  fill: var(--color-brand-red);
}

.chart-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid #F1F5F9;
  flex-wrap: wrap;
}

.legend-indicator {
  display: flex;
  align-items: center;
  gap: 5px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;

  &.line-dot {
    background-color: #0284C7;
  }
  &.limit-dot {
    background-color: var(--color-brand-red);
  }
  &.today-dot {
    background-color: #0E2138;
  }
}

.legend-text {
  font-size: 10.5px;
  font-weight: 600;
  color: var(--color-text-secondary);
}
</style>
