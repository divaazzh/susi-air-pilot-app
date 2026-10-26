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
          <div class="header-badge-wrap">
            <span class="modal-badge">Flight Duty Detail</span>
            <span class="placeholder-tag">Detail page coming soon</span>
          </div>
          <button class="modal-close-btn" @click="closeModal">✕</button>
        </div>

        <div class="modal-body">
          <div class="duty-detail-header" v-if="selectedDay">
            <div class="detail-base-badge" :style="selectedDay.duty ? { backgroundColor: selectedDay.duty.base_color } : {}">
              {{ selectedDay.duty ? selectedDay.duty.base_name : 'OFF' }}
            </div>
            <div class="detail-title-group">
              <h4 class="modal-title">{{ selectedDay.duty ? getDutyLabel(selectedDay.duty.duty_type) : 'Rest & Standby Day' }}</h4>
              <span class="detail-date">{{ formatFullDate(selectedDay.dateStr) }}</span>
            </div>
          </div>

          <div v-if="selectedDay && selectedDay.duty" class="duty-stats-row">
            <div class="stat-box">
              <span class="label">Duty Code</span>
              <span class="val">{{ selectedDay.duty.duty_type }}</span>
            </div>
            <div class="stat-box">
              <span class="label">Planned Legs</span>
              <span class="val">{{ selectedDay.duty.count_schedules }}</span>
            </div>
            <div class="stat-box">
              <span class="label">Logged</span>
              <span class="val">{{ selectedDay.duty.count_logbooks }}</span>
            </div>
            <div class="stat-box">
              <span class="label">Status</span>
              <span class="val-badge" :class="selectedDay.duty.count_logbooks === selectedDay.duty.count_schedules ? 'badge-ok' : 'badge-pending'">
                {{ selectedDay.duty.count_logbooks === selectedDay.duty.count_schedules ? 'Completed' : 'Pending' }}
              </span>
            </div>
          </div>

          <!-- Manifest legs -->
          <div class="manifest-section" v-if="selectedDay && selectedDay.duty && selectedDay.duty.count_schedules > 0">
            <h5 class="manifest-title">Operational Flight Legs</h5>
            <div class="manifest-legs">
              <div v-for="leg in getMockLegs(selectedDay.duty)" :key="leg.legNumber" class="leg-card">
                <div class="leg-top">
                  <span class="leg-num">Leg {{ leg.legNumber }}</span>
                  <span class="leg-route">{{ leg.from }} → {{ leg.to }}</span>
                  <span class="leg-time">{{ leg.time }}</span>
                </div>
                <div class="leg-bottom">
                  <span>Aircraft: <strong>{{ leg.aircraft }}</strong></span>
                  <span>Tail: <strong>{{ leg.tail }}</strong></span>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="off-duty-note">
            <p>No operational flight duties scheduled on this date. Designated rest day under CASR 135 fatigue management protocol.</p>
          </div>
        </div>

        <div class="modal-actions">
          <NuxtLink v-if="selectedDay && selectedDay.duty" to="/logbook" class="action-btn-primary" @click="closeModal">
            Open in eLogbook
          </NuxtLink>
          <button type="button" class="modal-confirm-btn" @click="closeModal">
            Close
          </button>
        </div>
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

function getDutyLabel(type: string) {
  const item = legend.value.find((l: any) => l.code === type);
  return item ? `${item.label} (${type})` : `Flight Duty (${type})`;
}

function formatFullDate(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function getMockLegs(duty: any) {
  const count = duty.count_schedules || 1;
  const base = duty.base_name || 'MKW';
  const routes: Record<string, string[]> = {
    MKW: ['SOQ', 'RDE', 'BXM', 'FKQ'],
    SIQ: ['CJN', 'HLP', 'TNJ', 'BTH'],
    CJN: ['HLP', 'BDG', 'SRG', 'SIQ'],
    PDG: ['SIQ', 'MES', 'RKI', 'GNS'],
    HLP: ['CJN', 'BKS', 'TKG', 'CBN'],
  };
  const destList = routes[base] || ['SOQ', 'TIM', 'DJJ', 'MKW'];
  const legs = [];
  const times = ['07:30', '10:15', '13:00', '15:45', '17:30', '19:00'];

  for (let i = 0; i < count; i++) {
    const dest = destList[i % destList.length];
    legs.push({
      legNumber: i + 1,
      from: i === 0 ? base : destList[(i - 1) % destList.length],
      to: dest,
      time: times[i % times.length],
      aircraft: 'Cessna 208B Grand Caravan',
      tail: `PK-VV${String.fromCharCode(65 + i)}`,
    });
  }
  return legs;
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

.header-badge-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
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

.placeholder-tag {
  font-size: 10px;
  font-weight: 700;
  color: #0284C7;
  background-color: #E0F2FE;
  padding: 2px 7px;
  border-radius: var(--radius-full);
}

.modal-close-btn {
  font-size: 16px;
  color: var(--color-text-secondary);
  padding: 4px;
}

.modal-body {
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.duty-detail-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-base-badge {
  font-size: 15px;
  font-weight: 800;
  color: #FFFFFF;
  background-color: var(--color-primary-navy);
  padding: 6px 12px;
  border-radius: var(--radius-sm);
}

.detail-title-group {
  display: flex;
  flex-direction: column;
}

.modal-title {
  font-size: 16px;
  font-weight: 800;
  color: var(--color-primary-navy);
}

.detail-date {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.duty-stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  background-color: #F8FAFC;
  padding: 8px;
  border-radius: var(--radius-sm);
}

.stat-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  .label {
    font-size: 9.5px;
    font-weight: 700;
    color: var(--color-text-muted);
    text-transform: uppercase;
  }

  .val {
    font-size: 13px;
    font-weight: 800;
    color: var(--color-primary-navy);
  }

  .val-badge {
    font-size: 9.5px;
    font-weight: 700;
    padding: 1px 5px;
    border-radius: 4px;

    &.badge-ok {
      background-color: var(--color-success-bg);
      color: var(--color-success);
    }

    &.badge-pending {
      background-color: var(--color-warning-bg);
      color: var(--color-warning);
    }
  }
}

.manifest-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.manifest-title {
  font-size: 12px;
  font-weight: 800;
  color: var(--color-primary-navy);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.manifest-legs {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 180px;
  overflow-y: auto;
}

.leg-card {
  background-color: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: var(--radius-sm);
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.leg-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.leg-num {
  font-size: 10px;
  font-weight: 800;
  color: var(--color-text-muted);
}

.leg-route {
  font-weight: 800;
  color: var(--color-primary-navy);
}

.leg-time {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-brand-red);
}

.leg-bottom {
  display: flex;
  justify-content: space-between;
  font-size: 10.5px;
  color: var(--color-text-secondary);

  strong {
    color: var(--color-primary-navy);
  }
}

.off-duty-note {
  background-color: #F1F5F9;
  padding: 12px;
  border-radius: var(--radius-sm);
  font-size: 11.5px;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.modal-actions {
  display: flex;
  gap: 8px;
}

.action-btn-primary {
  flex: 1;
  height: 40px;
  background-color: var(--color-brand-red);
  color: #FFFFFF;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;

  &:hover {
    background-color: var(--color-brand-red-hover);
  }
}

.modal-confirm-btn {
  flex: 1;
  height: 40px;
  background-color: var(--color-primary-navy);
  color: #FFFFFF;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 700;
}
</style>
