<template>
  <div class="logbook-page">
    <!-- Header -->
    <header class="logbook-header">
      <div class="header-content">
        <h1 class="page-title">Electronic Flight Logbook</h1>
        <p class="page-subtitle">CASR 121/135 Pilot Flight Duty Hours Record</p>
      </div>

      <button type="button" class="add-entry-btn" @click="showModal = true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="add-icon">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span>Log Flight</span>
      </button>
    </header>

    <main class="logbook-content">
      <!-- Overview Card -->
      <div class="stats-overview-card">
        <div class="stat-col">
          <span class="stat-label">Total Flight Time</span>
          <span class="stat-value">{{ currentTotalHours }} <small>hrs</small></span>
        </div>
        <div class="divider"></div>
        <div class="stat-col">
          <span class="stat-label">Evaluated Day (15 May)</span>
          <span class="stat-value">6.4 <small>hrs</small></span>
        </div>
        <div class="divider"></div>
        <div class="stat-col">
          <span class="stat-label">Compliance</span>
          <span class="stat-badge-safe">Verified</span>
        </div>
      </div>

      <!-- Recent Log Entries List -->
      <section class="records-section">
        <div class="section-title-wrap">
          <h2 class="section-title">Recent Flight Legs</h2>
          <span class="badge-count">{{ logs.length }} Entries</span>
        </div>

        <div class="records-list">
          <div v-for="log in logs" :key="log.id" class="record-card">
            <div class="record-top">
              <div class="route-badge">
                <span class="airport-code">{{ log.departure }}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="flight-arrow">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
                <span class="airport-code">{{ log.arrival }}</span>
              </div>

              <div class="hours-chip">
                <strong>+{{ log.flightHours }}</strong> hrs
              </div>
            </div>

            <div class="record-middle">
              <span class="aircraft-type">{{ log.aircraftType }}</span>
              <span class="tail-num">Tail: <strong>{{ log.tailNumber }}</strong></span>
            </div>

            <div class="record-bottom">
              <span class="record-date">{{ log.date }}</span>
              <span class="verified-tag" :class="{ pending: log.status === 'Pending Review' }">
                {{ log.status || 'Verified by OCC' }}
              </span>
            </div>

            <p v-if="log.remarks" class="record-remarks">"{{ log.remarks }}"</p>
          </div>
        </div>
      </section>
    </main>

    <!-- New Entry Modal -->
    <div v-if="showModal" class="modal-backdrop" @click.self="showModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3 class="modal-title">New Flight Log Entry</h3>
          <button type="button" class="close-btn" @click="showModal = false">✕</button>
        </div>

        <form class="entry-form" @submit.prevent="submitEntry">
          <div class="form-row">
            <div class="form-group flex-1">
              <label class="form-label">Duty Date</label>
              <input v-model="form.date" type="date" class="form-input" required />
            </div>

            <div class="form-group flex-1">
              <label class="form-label">Flight Hours</label>
              <input
                v-model.number="form.flightHours"
                type="number"
                step="0.1"
                min="0.1"
                max="8.0"
                class="form-input"
                placeholder="0.0"
                required
              />
            </div>
          </div>

          <div v-if="form.flightHours > 8" class="warning-text">
            ⚠️ Warning: Flight time exceeds maximum daily limit of 8 hours!
          </div>

          <div class="form-group">
            <label class="form-label">Aircraft Type</label>
            <select v-model="form.aircraftType" class="form-select" required>
              <option value="Cessna 208B Grand Caravan">Cessna 208B Grand Caravan</option>
              <option value="Pilatus PC-6 Porter">Pilatus PC-6 Porter</option>
              <option value="Piaggio P180 Avanti II">Piaggio P180 Avanti II</option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label class="form-label">Tail Number</label>
              <input v-model="form.tailNumber" type="text" class="form-input" placeholder="e.g. PK-VVF" required />
            </div>
            <div class="form-group flex-1">
              <label class="form-label">Origin Base</label>
              <input v-model="form.departure" type="text" class="form-input" placeholder="e.g. MKW" required />
            </div>
            <div class="form-group flex-1">
              <label class="form-label">Destination</label>
              <input v-model="form.arrival" type="text" class="form-input" placeholder="e.g. SOQ" required />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Pilot Remarks / Operational Notes</label>
            <input
              v-model="form.remarks"
              type="text"
              class="form-input"
              placeholder="e.g. Scheduled passenger flight, clear weather"
            />
          </div>

          <button type="submit" class="submit-entry-btn">
            Submit eLogbook Entry
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();
const config = useRuntimeConfig();

const currentTotalHours = ref(1444.5);
const showModal = ref(false);

const form = ref({
  date: '2026-05-15',
  flightHours: 2.5,
  aircraftType: 'Cessna 208B Grand Caravan',
  tailNumber: 'PK-VVM',
  departure: 'MKW',
  arrival: 'SOQ',
  remarks: 'Perintis passenger flight',
});

const defaultLogs = [
  {
    id: 'log_001',
    date: '2026-05-15',
    departure: 'MKW',
    arrival: 'SOQ',
    flightHours: 6.4,
    aircraftType: 'Cessna 208B Grand Caravan',
    tailNumber: 'PK-VVF',
    status: 'Verified by OCC',
    remarks: 'Routine scheduled coastal flight, 4 legs complete',
  },
  {
    id: 'log_002',
    date: '2026-05-14',
    departure: 'SIQ',
    arrival: 'CJN',
    flightHours: 6.7,
    aircraftType: 'Pilatus PC-6 Porter',
    tailNumber: 'PK-VVG',
    status: 'Verified by OCC',
    remarks: 'High elevation airstrip clearance',
  },
  {
    id: 'log_003',
    date: '2026-05-13',
    departure: 'SIQ',
    arrival: 'HLP',
    flightHours: 5.9,
    aircraftType: 'Cessna 208B Grand Caravan',
    tailNumber: 'PK-VVA',
    status: 'Verified by OCC',
    remarks: 'Cargo and medevac support',
  },
  {
    id: 'log_004',
    date: '2026-05-12',
    departure: 'MKW',
    arrival: 'TIM',
    flightHours: 4.6,
    aircraftType: 'Piaggio P180 Avanti II',
    tailNumber: 'PK-VVL',
    status: 'Verified by OCC',
    remarks: 'Executive charter flight',
  },
];

const logs = ref([...defaultLogs]);

function submitEntry() {
  const newEntry = {
    id: 'log_' + Date.now(),
    date: form.value.date,
    departure: form.value.departure.toUpperCase(),
    arrival: form.value.arrival.toUpperCase(),
    flightHours: Number(form.value.flightHours),
    aircraftType: form.value.aircraftType,
    tailNumber: form.value.tailNumber.toUpperCase(),
    status: 'Pending Review',
    remarks: form.value.remarks,
  };

  logs.value.unshift(newEntry);
  currentTotalHours.value = Math.round((currentTotalHours.value + newEntry.flightHours) * 10) / 10;
  if (authStore.pilot) {
    authStore.pilot.totalFlightHours = currentTotalHours.value;
  }
  showModal.value = false;
}

onMounted(() => {
  if (authStore.pilot?.totalFlightHours) {
    currentTotalHours.value = authStore.pilot.totalFlightHours;
  }
});
</script>

<style scoped lang="scss">
.logbook-page {
  display: flex;
  flex-direction: column;
}

.logbook-header {
  background: linear-gradient(135deg, var(--color-primary-navy) 0%, #152A44 100%);
  color: #FFFFFF;
  padding: 22px 18px 22px;
  border-radius: 0 0 var(--radius-xl) var(--radius-xl);
  box-shadow: var(--shadow-md);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.page-subtitle {
  font-size: 11px;
  color: #CBD5E1;
  margin-top: 2px;
}

.add-entry-btn {
  background-color: var(--color-brand-red);
  color: #FFFFFF;
  padding: 8px 14px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 6px rgba(230, 55, 87, 0.3);

  &:hover {
    background-color: var(--color-brand-red-hover);
  }
}

.add-icon {
  width: 14px;
  height: 14px;
}

.logbook-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stats-overview-card {
  background-color: #FFFFFF;
  border-radius: var(--radius-lg);
  padding: 14px 18px;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-col {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--color-text-secondary);
  text-transform: uppercase;
}

.stat-value {
  font-size: 18px;
  font-weight: 800;
  color: var(--color-primary-navy);

  small {
    font-size: 11px;
    font-weight: 600;
    color: var(--color-text-muted);
  }
}

.stat-badge-safe {
  background-color: var(--color-success-bg);
  color: var(--color-success);
  font-size: 11px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  width: fit-content;
  margin-top: 2px;
}

.divider {
  width: 1px;
  height: 32px;
  background-color: #E2E8F0;
}

.records-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-title-wrap {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 15px;
  font-weight: 800;
  color: var(--color-primary-navy);
}

.badge-count {
  font-size: 11px;
  font-weight: 700;
  background-color: #E2E8F0;
  color: var(--color-primary-navy);
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.record-card {
  background-color: #FFFFFF;
  border-radius: var(--radius-md);
  padding: 12px 14px;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.record-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.route-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #F1F5F9;
  padding: 3px 8px;
  border-radius: var(--radius-sm);
}

.airport-code {
  font-size: 13px;
  font-weight: 800;
  color: var(--color-primary-navy);
}

.flight-arrow {
  width: 12px;
  height: 12px;
  stroke: var(--color-brand-red);
}

.hours-chip {
  font-size: 12px;
  color: var(--color-text-secondary);

  strong {
    font-size: 15px;
    color: var(--color-primary-navy);
  }
}

.record-middle {
  display: flex;
  justify-content: space-between;
  font-size: 11.5px;
  color: var(--color-text-secondary);
}

.tail-num strong {
  color: var(--color-primary-navy);
}

.record-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: var(--color-text-muted);
  border-top: 1px solid #F8FAFC;
  padding-top: 4px;
}

.verified-tag {
  color: var(--color-success);
  font-weight: 700;

  &.pending {
    color: var(--color-warning);
  }
}

.record-remarks {
  font-size: 11px;
  font-style: italic;
  color: var(--color-text-secondary);
  background: #F8FAFC;
  padding: 4px 8px;
  border-radius: 4px;
}

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(14, 33, 56, 0.6);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal-card {
  width: 100%;
  max-width: 400px;
  background-color: #FFFFFF;
  border-radius: var(--radius-xl);
  padding: 22px 18px;
  box-shadow: var(--shadow-lg);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.modal-title {
  font-size: 16px;
  font-weight: 800;
  color: var(--color-primary-navy);
}

.close-btn {
  font-size: 16px;
  color: var(--color-text-secondary);
}

.entry-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-row {
  display: flex;
  gap: 10px;
}

.flex-1 {
  flex: 1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-primary-navy);
}

.form-input,
.form-select {
  height: 40px;
  padding: 0 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background-color: #F8FAFC;
  font-size: 12.5px;
  color: var(--color-primary-navy);

  &:focus {
    outline: none;
    border-color: var(--color-primary-navy);
    background-color: #FFFFFF;
  }
}

.warning-text {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-danger);
}

.submit-entry-btn {
  height: 44px;
  background-color: var(--color-brand-red);
  color: #FFFFFF;
  border-radius: var(--radius-full);
  font-size: 13.5px;
  font-weight: 700;
  margin-top: 6px;

  &:hover {
    background-color: var(--color-brand-red-hover);
  }
}
</style>
