<template>
  <div class="login-page">
    <div class="login-card">
      <!-- Top Brand Header -->
      <div class="brand-section">
        <SusiLogo variant="dark" />
        <p class="portal-tagline">Crew Flight Operations & Rostering Portal</p>
      </div>

      <!-- Welcome text -->
      <div class="greeting-box">
        <h2 class="login-heading">Pilot Sign In</h2>
        <p class="login-subtext">Enter your credentials to access flight duties</p>
      </div>

      <!-- Error Alert Banner -->
      <div v-if="authStore.error" class="error-banner">
        <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span>{{ authStore.error }}</span>
      </div>

      <!-- Login Form -->
      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username" class="form-label">Username</label>
          <div class="input-wrapper">
            <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <input
              id="username"
              v-model="username"
              type="text"
              class="form-input"
              placeholder="e.g. johndoe"
              required
              autocomplete="username"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <div class="input-wrapper">
            <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              id="password"
              v-model="password"
              type="password"
              class="form-input"
              placeholder="Enter flight access password"
              required
              autocomplete="current-password"
            />
          </div>
        </div>

        <button type="submit" class="submit-btn" :disabled="authStore.loading">
          <span v-if="!authStore.loading">Sign In</span>
          <span v-else class="loading-state">Verifying...</span>
        </button>
      </form>

      <!-- Test Credentials Helper Badge for Evaluators -->
      <div class="evaluator-hint">
        <span class="hint-title">Candidate Evaluation Account:</span>
        <div class="hint-pills">
          <span class="hint-pill">User: <strong>johndoe</strong></span>
          <span class="hint-pill">Pass: <strong>susiairtest</strong></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();
const username = ref('johndoe');
const password = ref('susiairtest');

async function handleLogin() {
  const ok = await authStore.login(username.value, password.value);
  if (ok) {
    navigateTo('/');
  }
}
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: var(--color-bg);
}

.login-card {
  width: 100%;
  max-width: 400px;
  background-color: var(--color-card);
  border-radius: var(--radius-xl);
  padding: 32px 24px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-border);
}

.brand-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 24px;
}

.portal-tagline {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-top: 8px;
}

.greeting-box {
  margin-bottom: 20px;
  text-align: center;
}

.login-heading {
  font-size: 20px;
  font-weight: 800;
  color: var(--color-primary-navy);
}

.login-subtext {
  font-size: 12.5px;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

.error-banner {
  background-color: var(--color-danger-bg);
  border: 1px solid rgba(230, 55, 87, 0.3);
  color: var(--color-danger);
  padding: 10px 14px;
  border-radius: var(--radius-md);
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 18px;
}

.error-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-primary-navy);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.field-icon {
  position: absolute;
  left: 12px;
  width: 18px;
  height: 18px;
  stroke: var(--color-text-muted);
}

.form-input {
  width: 100%;
  height: 44px;
  padding: 0 14px 0 38px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  background-color: #F8FAFC;
  font-size: 13.5px;
  color: var(--color-primary-navy);
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--color-primary-navy);
    background-color: #FFFFFF;
    box-shadow: 0 0 0 3px rgba(14, 33, 56, 0.08);
  }
}

.submit-btn {
  height: 46px;
  background-color: var(--color-brand-red);
  color: #FFFFFF;
  border-radius: var(--radius-full);
  font-size: 14px;
  font-weight: 700;
  margin-top: 6px;
  transition: background-color 0.2s ease, transform 0.1s ease;

  &:hover {
    background-color: var(--color-brand-red-hover);
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.evaluator-hint {
  margin-top: 24px;
  padding: 12px;
  background-color: #F1F5F9;
  border-radius: var(--radius-md);
  text-align: center;
}

.hint-title {
  font-size: 10.5px;
  font-weight: 700;
  color: var(--color-text-secondary);
  display: block;
  margin-bottom: 6px;
}

.hint-pills {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.hint-pill {
  font-size: 11px;
  background-color: #FFFFFF;
  padding: 3px 8px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  color: var(--color-primary-navy);
}
</style>
