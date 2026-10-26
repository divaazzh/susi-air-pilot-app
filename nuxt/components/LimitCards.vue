<template>
  <div class="limit-cards-grid">
    <div
      v-for="card in cards"
      :key="card.key"
      class="limit-card"
      :class="{ 'over-limit': card.isOverLimit }"
    >
      <div class="card-top">
        <span class="card-label">{{ card.label }}</span>
        <span
          class="status-pill"
          :class="card.isOverLimit ? 'pill-danger' : card.percentage > 85 ? 'pill-warning' : 'pill-safe'"
        >
          {{ card.percentage }}%
        </span>
      </div>

      <div class="card-values">
        <span class="current-value">{{ card.currentHours }}</span>
        <span class="limit-value">/ {{ card.limitHours }} hrs</span>
      </div>

      <!-- Progress bar -->
      <div class="progress-track">
        <div
          class="progress-fill"
          :class="{
            'fill-danger': card.isOverLimit,
            'fill-warning': !card.isOverLimit && card.percentage > 85,
            'fill-safe': !card.isOverLimit && card.percentage <= 85,
          }"
          :style="{ width: `${Math.min(100, card.percentage)}%` }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  cards: Array<{
    label: string;
    key: string;
    currentHours: number;
    limitHours: number;
    percentage: number;
    isOverLimit: boolean;
  }>;
}>();
</script>

<style scoped lang="scss">
.limit-cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.limit-card {
  background-color: var(--color-card);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  transition: transform 0.15s ease;

  &.over-limit {
    border-color: var(--color-danger);
    background-color: #FFF5F5;
  }
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.card-label {
  font-size: 11.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-secondary);
}

.status-pill {
  font-size: 10px;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: var(--radius-full);

  &.pill-safe {
    background-color: var(--color-success-bg);
    color: var(--color-success);
  }
  &.pill-warning {
    background-color: var(--color-warning-bg);
    color: var(--color-warning);
  }
  &.pill-danger {
    background-color: var(--color-danger-bg);
    color: var(--color-danger);
  }
}

.card-values {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 8px;
}

.current-value {
  font-size: 20px;
  font-weight: 800;
  color: var(--color-primary-navy);
  line-height: 1;
}

.limit-value {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted);
}

.progress-track {
  width: 100%;
  height: 5px;
  background-color: #E2E8F0;
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.3s ease;

  &.fill-safe {
    background-color: var(--color-success);
  }
  &.fill-warning {
    background-color: var(--color-warning);
  }
  &.fill-danger {
    background-color: var(--color-danger);
  }
}
</style>
