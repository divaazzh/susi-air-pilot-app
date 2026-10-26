<template>
  <div class="susi-brand-logo" :class="{ light: variant === 'light' }">
    <img
      :src="logoSrc"
      alt="Susi Air Logo"
      class="official-logo-img"
    />
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

const config = useRuntimeConfig();
const baseUrl = config.app.baseURL || '/';

const logoSrc = computed(() => {
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return props.variant === 'light'
    ? `${cleanBase}susi-air-logo-white.png`
    : `${cleanBase}susi-air-logo-transparent.png`;
});
</script>

<style scoped lang="scss">
.susi-brand-logo {
  display: flex;
  align-items: center;
  justify-content: center;

  .official-logo-img {
    height: 38px;
    width: auto;
    object-fit: contain;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.08));
    transition: transform 0.2s ease;
  }

  &.light {
    .official-logo-img {
      height: 34px;
      filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.25));
    }
  }
}
</style>
