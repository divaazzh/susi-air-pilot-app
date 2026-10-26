<template>
  <nav class="bottom-nav">
    <NuxtLink to="/" class="nav-item" :class="{ active: currentRoute === '/' }">
      <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
      <span class="nav-label">Home</span>
    </NuxtLink>

    <NuxtLink to="/schedule" class="nav-item" :class="{ active: currentRoute === '/schedule' }">
      <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
      </svg>
      <span class="nav-label">Schedule</span>
    </NuxtLink>

    <NuxtLink to="/logbook" class="nav-item" :class="{ active: currentRoute === '/logbook' }">
      <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
        <path d="M6 6h10" />
        <path d="M6 10h10" />
      </svg>
      <span class="nav-label">Logbook</span>
    </NuxtLink>

    <NuxtLink to="/more" class="nav-item" :class="{ active: currentRoute === '/more' }">
      <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
        <circle cx="5" cy="12" r="1" />
      </svg>
      <span class="nav-label">More</span>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
const route = useRoute();
const currentRoute = computed(() => route.path);
</script>

<style scoped lang="scss">
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  height: 64px;
  background-color: #FFFFFF;
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-around;
  z-index: 50;
  box-shadow: 0 -4px 10px rgba(14, 33, 56, 0.05);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  color: var(--color-text-secondary);
  font-size: 11px;
  font-weight: 600;
  text-decoration: none;
  background: none;
  border: none;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;

  &.active {
    color: var(--color-brand-red);

    .nav-icon {
      stroke: var(--color-brand-red);
    }
  }

  &:hover {
    color: var(--color-primary-navy);
  }
}

.nav-icon {
  width: 20px;
  height: 20px;
  stroke: var(--color-text-secondary);
  transition: stroke 0.2s ease;
}

.nav-toast {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--color-primary-navy);
  color: #FFFFFF;
  padding: 8px 18px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 600;
  z-index: 100;
  box-shadow: var(--shadow-lg);
  pointer-events: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, 8px);
}
</style>
