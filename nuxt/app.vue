<template>
  <div class="app-viewport">
    <div class="mobile-container">
      <NuxtPage />
      <BottomNav v-if="showNav" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';

const route = useRoute();
const authStore = useAuthStore();

const showNav = computed(() => {
  return route.path !== '/login';
});

onMounted(() => {
  authStore.initAuth();
});
</script>

<style scoped>
/* Scoped layout rules */
</style>
