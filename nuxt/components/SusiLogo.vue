<template>
  <div class="susi-brand-logo" :class="{ light: variant === 'light' }">
    <div class="logo-icon">
      <!-- Susi Air stylized wing / aircraft icon -->
      <svg viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon-svg">
        <path d="M5 25C20 10 45 5 70 8C85 10 95 18 95 18C95 18 80 15 65 17C45 20 25 28 5 25Z" :fill="iconAccent" />
        <path d="M12 28C28 20 50 17 72 20C82 22 90 27 90 27C90 27 78 24 65 25C48 27 30 32 12 28Z" :fill="iconColor" />
        <circle cx="82" cy="12" r="3" :fill="dotColor" />
      </svg>
    </div>
    <div class="brand-text">
      <span class="brand-title">SUSI AIR</span>
      <span class="brand-subtitle">PILOT OPERATIONS</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  variant: {
    type: String,
    default: 'dark', // 'dark' (navy text) or 'light' (white text on navy header)
  },
});

const iconColor = computed(() => (props.variant === 'light' ? '#FFFFFF' : '#0E2138'));
const iconAccent = computed(() => '#E63757');
const dotColor = computed(() => '#22C5E8');
</script>

<style scoped lang="scss">
.susi-brand-logo {
  display: flex;
  align-items: center;
  gap: 10px;

  .logo-icon {
    width: 44px;
    height: 22px;
    display: flex;
    align-items: center;
  }

  .icon-svg {
    width: 100%;
    height: 100%;
    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));
  }

  .brand-text {
    display: flex;
    flex-direction: column;
    line-height: 1.1;
  }

  .brand-title {
    font-size: 15px;
    font-weight: 800;
    letter-spacing: 0.12em;
    color: var(--color-primary-navy);
  }

  .brand-subtitle {
    font-size: 8.5px;
    font-weight: 700;
    letter-spacing: 0.22em;
    color: var(--color-brand-red);
  }

  &.light {
    .brand-title {
      color: #FFFFFF;
    }
    .brand-subtitle {
      color: #F87171;
    }
  }
}
</style>
