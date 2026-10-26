<template>
  <div class="home-page">
    <!-- Top Header Bar -->
    <header class="app-header">
      <div class="header-top">
        <SusiLogo variant="light" />
        <button class="logout-btn" title="Sign Out" @click="authStore.logout">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="logout-icon">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>

      <!-- Pilot Profile Greeting Card -->
      <div class="pilot-profile-card">
        <div class="pilot-avatar-wrap">
          <img
            :src="pilot?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'"
            alt="Pilot Avatar"
            class="pilot-avatar"
          />
          <span class="online-indicator"></span>
        </div>

        <div class="pilot-meta">
          <span class="greeting-text">Welcome back, Captain</span>
          <h1 class="pilot-name">{{ pilot?.name || 'John Doe' }}</h1>
          <div class="hours-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="clock-icon">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>Total Flight: <strong>{{ pilot?.totalFlightHours || 1444.5 }} hrs</strong></span>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="home-content">
      <!-- Section: Hours to Limit -->
      <section class="content-section">
        <div class="section-heading">
          <h2 class="title">Hours to Limit</h2>
          <span class="badge-tag">Regulatory Caps</span>
        </div>

        <!-- 4 Summary Cards (Daily, Weekly, Monthly, Annual) -->
        <LimitCards :cards="summaryData.cards" />

        <!-- Flight Hours Trend Chart -->
        <div class="chart-wrapper">
          <TrendChart
            :active-range="selectedRange"
            :limit="summaryData.limit"
            :max-y="summaryData.maxY"
            :chart-data="summaryData.chart"
            @update:range="handleRangeChange"
          />
        </div>
      </section>

      <!-- Section: My Documents -->
      <section class="content-section">
        <DocumentList :documents="documents" />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();
const config = useRuntimeConfig();

const pilot = ref(authStore.pilot);
const selectedRange = ref('1w');

const summaryData = ref({
  limit: 40,
  maxY: 45,
  cards: [
    { label: 'Daily', key: 'daily', currentHours: 6.4, limitHours: 8, percentage: 80, isOverLimit: false },
    { label: 'Weekly', key: 'weekly', currentHours: 25.2, limitHours: 40, percentage: 63, isOverLimit: false },
    { label: 'Monthly', key: 'monthly', currentHours: 87.2, limitHours: 100, percentage: 87, isOverLimit: false },
    { label: 'Annual', key: 'annual', currentHours: 1013.8, limitHours: 1050, percentage: 97, isOverLimit: false },
  ],
  chart: [] as any[],
});

const documents = ref([] as any[]);

async function fetchSummary(range: string) {
  try {
    const res = await $fetch<any>(`${config.public.apiBase}/flight-hours/summary?range=${range}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    if (res) {
      summaryData.value = res;
    }
  } catch (e) {
    console.error('Failed to fetch summary', e);
  }
}

async function fetchDocuments() {
  try {
    const res = await $fetch<any>(`${config.public.apiBase}/documents`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
    });
    if (res && res.documents) {
      documents.value = res.documents;
    }
  } catch (e) {
    console.error('Failed to fetch documents', e);
  }
}

function handleRangeChange(r: string) {
  selectedRange.value = r;
  fetchSummary(r);
}

onMounted(async () => {
  if (!authStore.pilot) {
    await authStore.fetchProfile();
  }
  pilot.value = authStore.pilot;
  await Promise.all([
    fetchSummary(selectedRange.value),
    fetchDocuments(),
  ]);
});
</script>

<style scoped lang="scss">
.home-page {
  display: flex;
  flex-direction: column;
}

.app-header {
  background: linear-gradient(135deg, var(--color-primary-navy) 0%, #152A44 100%);
  color: #FFFFFF;
  padding: 20px 18px 24px;
  border-radius: 0 0 var(--radius-xl) var(--radius-xl);
  box-shadow: var(--shadow-md);
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.logout-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #FFFFFF;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
}

.logout-icon {
  width: 18px;
  height: 18px;
}

.pilot-profile-card {
  display: flex;
  align-items: center;
  gap: 14px;
}

.pilot-avatar-wrap {
  position: relative;
  width: 58px;
  height: 58px;
  flex-shrink: 0;
}

.pilot-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #22C5E8;
}

.online-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background-color: var(--color-success);
  border-radius: 50%;
  border: 2px solid var(--color-primary-navy);
}

.pilot-meta {
  display: flex;
  flex-direction: column;
}

.greeting-text {
  font-size: 11.5px;
  font-weight: 500;
  color: #CBD5E1;
}

.pilot-name {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.01em;
  margin-top: -2px;
}

.hours-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(255, 255, 255, 0.12);
  padding: 3px 9px;
  border-radius: var(--radius-full);
  font-size: 11px;
  color: #E2E8F0;
  margin-top: 4px;
  width: fit-content;

  strong {
    color: #22C5E8;
  }
}

.clock-icon {
  width: 12px;
  height: 12px;
}

.home-content {
  padding: 18px 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.content-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .title {
    font-size: 16px;
    font-weight: 800;
    color: var(--color-primary-navy);
  }

  .badge-tag {
    font-size: 10.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background-color: #E2E8F0;
    color: var(--color-primary-navy);
    padding: 2px 7px;
    border-radius: var(--radius-sm);
  }
}

.chart-wrapper {
  margin-top: 4px;
}
</style>
