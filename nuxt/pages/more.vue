<template>
  <div class="more-page">
    <header class="more-header">
      <div class="header-content">
        <h1 class="page-title">Operations & Fleet Info</h1>
        <p class="page-subtitle">Susi Air Operational Bases & Aircraft Reference</p>
      </div>
    </header>

    <main class="more-content">
      <!-- Pilot Account Card -->
      <div class="account-card">
        <div class="account-avatar-wrap">
          <img
            :src="authStore.pilot?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'"
            alt="Captain Avatar"
            class="account-avatar"
          />
        </div>
        <div class="account-details">
          <span class="role-tag">Pilot-in-Command (PIC)</span>
          <h2 class="pilot-name">{{ authStore.pilot?.name || 'John Doe' }}</h2>
          <span class="hours-text">Total Flown: <strong>{{ authStore.pilot?.totalFlightHours || 1444.5 }} hrs</strong></span>
        </div>
        <button type="button" class="signout-btn" @click="authStore.logout">
          Sign Out
        </button>
      </div>

      <!-- Regulatory Caps Reference -->
      <section class="info-section">
        <h3 class="section-title">CASR Pilot Duty Limits</h3>
        <div class="limits-table">
          <div class="limit-row">
            <span class="limit-col-name">Daily Flight Cap</span>
            <span class="limit-col-value">8.0 hrs / day</span>
          </div>
          <div class="limit-row">
            <span class="limit-col-name">Weekly Rolling Cap</span>
            <span class="limit-col-value">40.0 hrs / 7 days</span>
          </div>
          <div class="limit-row">
            <span class="limit-col-name">Monthly Rolling Cap</span>
            <span class="limit-col-value">100.0 hrs / 30 days</span>
          </div>
          <div class="limit-row">
            <span class="limit-col-name">Annual Rolling Cap</span>
            <span class="limit-col-value">1050.0 hrs / 365 days</span>
          </div>
        </div>
      </section>

      <!-- Operational Bases Directory -->
      <section class="info-section">
        <h3 class="section-title">Main Operational Base Stations</h3>
        <div class="bases-grid">
          <div v-for="b in bases" :key="b.code" class="base-card">
            <div class="base-top">
              <span class="base-code">{{ b.code }}</span>
              <span class="base-region">{{ b.region }}</span>
            </div>
            <div class="base-name">{{ b.name }}</div>
            <div class="base-details">
              <span>Runway: {{ b.runway }}</span>
              <span>Freq: {{ b.frequency }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Fleet Specifications -->
      <section class="info-section">
        <h3 class="section-title">Active Fleet Specifications</h3>
        <div class="fleet-list">
          <div v-for="f in fleet" :key="f.model" class="fleet-card">
            <div class="fleet-info">
              <h4 class="fleet-model">{{ f.model }}</h4>
              <span class="fleet-role">{{ f.role }}</span>
            </div>
            <div class="fleet-specs">
              <span class="spec-pill">Pax: {{ f.pax }}</span>
              <span class="spec-pill">Cruise: {{ f.speed }}</span>
              <span class="spec-pill">Engine: {{ f.engine }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- System Diagnostic -->
      <section class="info-section">
        <h3 class="section-title">System & Candidate Diagnostics</h3>
        <div class="diag-card">
          <div class="diag-item">
            <span>Candidate:</span>
            <strong>Diva Firnanda Azzahra</strong>
          </div>
          <div class="diag-item">
            <span>Target Position:</span>
            <strong>Full Stack Developer (Susi Air)</strong>
          </div>
          <div class="diag-item">
            <span>Stack:</span>
            <strong>Nuxt 3 (Composition API) + NestJS</strong>
          </div>
          <div class="diag-item">
            <span>System Evaluation Date:</span>
            <strong>2026-05-15 (Fixed anchor)</strong>
          </div>
          <div class="diag-item">
            <span>Math Service:</span>
            <code>rollingWindowBluffing()</code>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();

const bases = [
  { code: 'MKW', name: 'Rendani Airport (Manokwari)', region: 'West Papua', runway: '2,000m Asphalt', frequency: '122.40 MHz' },
  { code: 'SIQ', name: 'Dabo Singkep Airport', region: 'Riau Islands', runway: '1,300m Asphalt', frequency: '122.80 MHz' },
  { code: 'CJN', name: 'Nusawiru Airport (Cijulang)', region: 'Pangandaran HQ', runway: '1,400m Asphalt', frequency: '122.20 MHz' },
  { code: 'PDG', name: 'Minangkabau Int Airport', region: 'West Sumatra', runway: '3,000m Asphalt', frequency: '118.15 MHz' },
  { code: 'HLP', name: 'Halim Perdanakusuma', region: 'Jakarta Base', runway: '3,000m Asphalt', frequency: '118.60 MHz' },
  { code: 'TIM', name: 'Mozes Kilangin Airport', region: 'Timika Papua', runway: '2,390m Asphalt', frequency: '123.50 MHz' },
];

const fleet = [
  { model: 'Cessna 208B Grand Caravan EX', role: 'Passenger & Remote Cargo Transport', pax: '12 Pax', speed: '185 kts', engine: 'PT6A-140' },
  { model: 'Pilatus PC-6 B2-H4 Turbo Porter', role: 'Short Takeoff and Landing (STOL)', pax: '7 Pax', speed: '125 kts', engine: 'PT6A-27' },
  { model: 'Piaggio P180 Avanti II', role: 'Executive VIP Charter & Medevac', pax: '8 Pax', speed: '395 kts', engine: 'PT6A-66B Twin' },
];
</script>

<style scoped lang="scss">
.more-page {
  display: flex;
  flex-direction: column;
}

.more-header {
  background: linear-gradient(135deg, var(--color-primary-navy) 0%, #152A44 100%);
  color: #FFFFFF;
  padding: 24px 18px 22px;
  border-radius: 0 0 var(--radius-xl) var(--radius-xl);
  box-shadow: var(--shadow-md);
}

.page-title {
  font-size: 19px;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.page-subtitle {
  font-size: 11.5px;
  color: #CBD5E1;
  margin-top: 2px;
}

.more-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.account-card {
  background-color: #FFFFFF;
  border-radius: var(--radius-lg);
  padding: 14px 16px;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  gap: 12px;
}

.account-avatar-wrap {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #22C5E8;
  flex-shrink: 0;
}

.account-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.account-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.role-tag {
  font-size: 9.5px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--color-brand-red);
}

.pilot-name {
  font-size: 15px;
  font-weight: 800;
  color: var(--color-primary-navy);
}

.hours-text {
  font-size: 11px;
  color: var(--color-text-secondary);

  strong {
    color: var(--color-primary-navy);
  }
}

.signout-btn {
  background-color: #FEE2E2;
  color: var(--color-danger);
  padding: 6px 12px;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 700;
}

.info-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-title {
  font-size: 14px;
  font-weight: 800;
  color: var(--color-primary-navy);
}

.limits-table {
  background-color: #FFFFFF;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  overflow: hidden;
}

.limit-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 14px;
  font-size: 12px;
  border-bottom: 1px solid #F1F5F9;

  &:last-child {
    border-bottom: none;
  }
}

.limit-col-name {
  color: var(--color-text-secondary);
}

.limit-col-value {
  font-weight: 700;
  color: var(--color-primary-navy);
}

.bases-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.base-card {
  background-color: #FFFFFF;
  border-radius: var(--radius-md);
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.base-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.base-code {
  font-size: 14px;
  font-weight: 800;
  color: var(--color-primary-navy);
}

.base-region {
  font-size: 9px;
  font-weight: 700;
  color: var(--color-brand-red);
}

.base-name {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.2;
}

.base-details {
  font-size: 9.5px;
  color: var(--color-text-muted);
  display: flex;
  flex-direction: column;
  margin-top: 2px;
}

.fleet-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.fleet-card {
  background-color: #FFFFFF;
  border-radius: var(--radius-md);
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.fleet-model {
  font-size: 13px;
  font-weight: 800;
  color: var(--color-primary-navy);
}

.fleet-role {
  font-size: 10.5px;
  color: var(--color-text-secondary);
}

.fleet-specs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.spec-pill {
  font-size: 9.5px;
  background-color: #F1F5F9;
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--color-primary-navy);
  font-weight: 600;
}

.diag-card {
  background-color: #FFFFFF;
  border-radius: var(--radius-md);
  padding: 12px 14px;
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.diag-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11.5px;
  color: var(--color-text-secondary);

  strong {
    color: var(--color-primary-navy);
  }

  code {
    background-color: #F1F5F9;
    padding: 2px 6px;
    border-radius: 4px;
    color: var(--color-brand-red);
    font-size: 11px;
  }
}
</style>
