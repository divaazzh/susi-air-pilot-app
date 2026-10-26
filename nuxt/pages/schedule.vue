<template>
  <div class="schedule-page">
    <!-- Header -->
    <header class="schedule-header">
      <div class="header-content">
        <h1 class="page-title">Duty Roster</h1>
        <p class="page-subtitle">Monthly Schedule & Operational Base</p>
      </div>
    </header>

    <main class="schedule-content">
      <!-- Calendar Card -->
      <div class="calendar-card">
        <!-- Month Navigation Bar -->
        <div class="month-nav">
          <button type="button" class="nav-arrow" @click="changeMonth(-1)" :disabled="loading">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="arrow-icon">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div class="current-month-display">
            <span class="month-name">{{ monthName }}</span>
            <span class="year-num">{{ currentYear }}</span>
          </div>

          <button type="button" class="nav-arrow" @click="changeMonth(1)" :disabled="loading">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="arrow-icon">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        <!-- Weekday Headers -->
        <div class="weekday-grid">
          <span v-for="d in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="d" class="weekday-cell">
            {{ d }}
          </span>
        </div>

        <!-- Days Grid -->
        <div class="calendar-grid">
          <!-- Leading blank days -->
          <div
            v-for="b in leadingBlankDays"
            :key="`blank-${b}`"
            class="day-cell blank-cell"
          ></div>

          <!-- Active Month Days -->
          <div
            v-for="day in daysInMonth"
            :key="day.dateStr"
            class="day-cell"
            :class="{
              'has-duty': !!day.duty,
              'is-today': day.dateStr === '2026-05-15',
            }"
            :style="day.duty ? { backgroundColor: hexToRgba(day.duty.base_color, 0.18), borderColor: day.duty.base_color } : {}"
            @click="openDetail(day)"
          >
            <!-- Badge at top-right of cell -->
            <div class="cell-top">
              <span class="day-number">{{ day.dayNumber }}</span>

              <template v-if="day.duty">
                <!-- Tick icon when logged equals scheduled -->
                <span
                  v-if="day.duty.count_logbooks === day.duty.count_schedules"
                  class="duty-badge badge-tick"
                  :style="{ backgroundColor: day.duty.base_color }"
                  title="Completed & Logged"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="3" class="tick-svg">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>

                <!-- Remaining duties number badge -->
                <span
                  v-else
                  class="duty-badge badge-count"
                  :style="{ backgroundColor: day.duty.base_color }"
                  title="Pending Duties"
                >
                  {{ day.duty.count_schedules - day.duty.count_logbooks }}
                </span>
              </template>
            </div>

            <!-- Base code or Duty code label -->
            <div v-if="day.duty" class="cell-bottom">
              <span class="base-tag" :style="{ color: day.duty.base_color }">
                {{ day.duty.base_name }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Duty Legend Section -->
      <div class="legend-card">
        <h3 class="legend-heading">Duty Type Legend</h3>
        <div class="legend-grid">
          <div v-for="item in legend" :key="item.code" class="legend-item">
            <span class="legend-color-box" :style="{ backgroundColor: item.color }"></span>
            <span class="legend-code">{{ item.code }}</span>
            <span class="legend-label">{{ item.label }}</span>
          </div>
        </div>
      </div>
    </main>

    <!-- Detail Placeholder Modal -->
    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-card">
        <div class="modal-header">
          <span class="modal-badge">Flight Duty Detail</span>
          <button class="modal-close-btn" @click="closeModal">✕</button>
        </div>

        <div class="modal-body">
          <div class="placeholder-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="plane-icon">
              <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
            </svg>
          </div>
          <h4 class="modal-title">Detail page coming soon</h4>
          <p class="modal-desc" v-if="selectedDay">
            Selected Date: <strong>{{ selectedDay.dateStr }}</strong>
            <template v-if="selectedDay.duty">
              <br />Duty: <strong>{{ selectedDay.duty.duty_type }}</strong> · Base: <strong>{{ selectedDay.duty.base_name }}</strong>
            </template>
          </p>
          <p class="modal-sub">This section will contain flight legs, route manifest, aircraft tail number, and crew briefing.</p>
        </div>

        <button type="button" class="modal-confirm-btn" @click="closeModal">
          Understood
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { ClientFlightService } from '~/utils/flight-service';

const authStore = useAuthStore();
const config = useRuntimeConfig();

const currentYear = ref(2026);
const currentMonth = ref(5); // May
const loading = ref(false);

const initialSchedules = ClientFlightService.getSchedules(2026, 5);
const schedules = ref(initialSchedules.schedules);
const legend = ref(initialSchedules.legend);

const showModal = ref(false);
const selectedDay = ref<any>(null);

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const monthName = computed(() => monthNames[currentMonth.value - 1]);

// Calculate leading blank days (Sunday is 0)
const leadingBlankDays = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value - 1, 1).getDay();
  return firstDay;
});

// Calculate array of days for current month
const daysInMonth = computed(() => {
  const totalDays = new Date(currentYear.value, currentMonth.value, 0).getDate();
  const scheduleMap = new Map<string, any>();

  for (const s of schedules.value) {
    scheduleMap.set(s.duty_date, s);
  }

  const result = [];
  for (let i = 1; i <= totalDays; i++) {
    const mStr = String(currentMonth.value).padStart(2, '0');
    const dStr = String(i).padStart(2, '0');
    const dateStr = `${currentYear.value}-${mStr}-${dStr}`;
    result.push({
      dayNumber: i,
      dateStr,
      duty: scheduleMap.get(dateStr) || null,
    });
  }
  return result;
});

async function fetchSchedules() {
  loading.value = true;
  try {
    const mStr = String(currentMonth.value).padStart(2, '0');
    const res = await $fetch<any>(`${config.public.apiBase}/schedules?year=${currentYear.value}&month=${mStr}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`,
      },
      timeout: 3000,
    });

    if (res) {
      schedules.value = res.schedules || [];
      if (res.legend) {
        legend.value = res.legend;
      }
    }
  } catch (e) {
    console.warn('Backend unavailable, using fallback schedules calculation', e);
    const fallback = ClientFlightService.getSchedules(currentYear.value, currentMonth.value);
    schedules.value = fallback.schedules;
    legend.value = fallback.legend;
  } finally {
    loading.value = false;
  }
}

function changeMonth(delta: number) {
  let newMonth = currentMonth.value + delta;
  let newYear = currentYear.value;

  if (newMonth < 1) {
    newMonth = 12;
    newYear -= 1;
  } else if (newMonth > 12) {
    newMonth = 1;
    newYear += 1;
  }

  currentMonth.value = newMonth;
  currentYear.value = newYear;
  fetchSchedules();
}

function openDetail(day: any) {
  selectedDay.value = day;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  selectedDay.value = null;
}

function hexToRgba(hex: string, alpha: number) {
  if (!hex || !hex.startsWith('#')) return 'transparent';
  let c = hex.substring(1);
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('');
  }
  const num = parseInt(c, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

onMounted(() => {
  fetchSchedules();
});
</script>

<style scoped lang="scss">
.schedule-page {
  display: flex;
  flex-direction: column;
}

.schedule-header {
  background: linear-gradient(135deg, var(--color-primary-navy) 0%, #152A44 100%);
  color: #FFFFFF;
  padding: 24px 18px 20px;
  border-radius: 0 0 var(--radius-xl) var(--radius-xl);
  box-shadow: var(--shadow-md);
}

.page-title {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.page-subtitle {
  font-size: 12px;
  color: #CBD5E1;
  margin-top: 2px;
}

.schedule-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.calendar-card {
  background-color: var(--color-card);
  border-radius: var(--radius-lg);
  padding: 16px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
}

.month-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.nav-arrow {
  width: 34px;
  height: 34px;
  border-radius: var(--radius-full);
  background-color: #F1F5F9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary-navy);
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    background-color: #E2E8F0;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.arrow-icon {
  width: 16px;
  height: 16px;
}

.current-month-display {
  display: flex;
  align-items: baseline;
  gap: 6px;

  .month-name {
    font-size: 16px;
    font-weight: 800;
    color: var(--color-primary-navy);
  }

  .year-num {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-secondary);
  }
}

.weekday-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  margin-bottom: 6px;
}

.weekday-cell {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-muted);
  text-transform: uppercase;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.day-cell {
  aspect-ratio: 1;
  border-radius: var(--radius-sm);
  border: 1px solid #F1F5F9;
  background-color: #FAFAFA;
  padding: 3px 4px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.1s ease;

  &.blank-cell {
    background: transparent;
    border: none;
    cursor: default;
  }

  &.is-today {
    box-shadow: 0 0 0 2px var(--color-primary-navy);
    font-weight: 800;
  }

  &:hover:not(.blank-cell) {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(14, 33, 56, 0.1);
  }
}

.cell-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
}

.day-number {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-primary-navy);
  line-height: 1;
}

.duty-badge {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  font-size: 8.5px;
  font-weight: 800;
  line-height: 1;
}

.tick-svg {
  width: 9px;
  height: 9px;
}

.cell-bottom {
  display: flex;
  justify-content: center;
  width: 100%;
}

.base-tag {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.04em;
  line-height: 1;
}

.legend-card {
  background-color: var(--color-card);
  border-radius: var(--radius-lg);
  padding: 16px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
}

.legend-heading {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-primary-navy);
  margin-bottom: 12px;
}

.legend-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-color-box {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  flex-shrink: 0;
}

.legend-code {
  font-size: 11px;
  font-weight: 800;
  color: var(--color-primary-navy);
}

.legend-label {
  font-size: 11px;
  color: var(--color-text-secondary);
}

/* Modal styling */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(14, 33, 56, 0.6);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-card {
  width: 100%;
  max-width: 360px;
  background: #FFFFFF;
  border-radius: var(--radius-xl);
  padding: 24px 20px;
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  animation: popIn 0.2s ease-out;
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: scale(0.92);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.modal-badge {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--color-brand-red);
  background-color: var(--color-brand-red-light);
  padding: 3px 8px;
  border-radius: var(--radius-full);
}

.modal-close-btn {
  font-size: 16px;
  color: var(--color-text-secondary);
  padding: 4px;
}

.modal-body {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.placeholder-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background-color: #E0F2FE;
  color: #0284C7;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.plane-icon {
  width: 26px;
  height: 26px;
}

.modal-title {
  font-size: 17px;
  font-weight: 800;
  color: var(--color-primary-navy);
}

.modal-desc {
  font-size: 12.5px;
  color: var(--color-text-primary);
  margin-top: 6px;
  line-height: 1.4;
}

.modal-sub {
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: 8px;
}

.modal-confirm-btn {
  height: 42px;
  background-color: var(--color-primary-navy);
  color: #FFFFFF;
  border-radius: var(--radius-full);
  font-size: 13.5px;
  font-weight: 700;
}
</style>
