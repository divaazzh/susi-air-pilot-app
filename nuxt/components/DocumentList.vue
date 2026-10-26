<template>
  <div class="document-section">
    <div class="section-header">
      <h3 class="section-title">My Documents</h3>
      <span class="section-meta">{{ documents.length }} Credentials</span>
    </div>

    <div class="document-list">
      <div v-for="doc in documents" :key="doc.id" class="document-item">
        <div class="doc-left">
          <div class="doc-icon-box" :class="`icon-${doc.color}`">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="doc-icon">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div class="doc-info">
            <span class="doc-title">{{ doc.label }}</span>
            <span class="doc-date">Expires {{ formatDate(doc.expiryDate) }}</span>
          </div>
        </div>

        <div class="doc-badge" :class="`badge-${doc.color}`">
          <span v-if="doc.status === 'expired'">EXPIRED</span>
          <span v-else-if="doc.status === 'soon'">{{ doc.daysRemaining }}d left</span>
          <span v-else>SAFE ({{ doc.daysRemaining }}d)</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  documents: Array<{
    id: string;
    label: string;
    expiryDate: string;
    daysRemaining: number;
    status: 'safe' | 'soon' | 'expired';
    color: 'green' | 'amber' | 'red';
  }>;
}>();

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${parseInt(parts[2], 10)} ${months[parseInt(parts[1], 10) - 1]} ${parts[0]}`;
  }
  return dateStr;
}
</script>

<style scoped lang="scss">
.document-section {
  background-color: var(--color-card);
  border-radius: var(--radius-lg);
  padding: 16px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-primary-navy);
}

.section-meta {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.document-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.document-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background-color: #F8FAFC;
  border-radius: var(--radius-md);
  border: 1px solid #EEF2F6;
}

.doc-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.doc-icon-box {
  width: 34px;
  height: 34px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;

  &.icon-green {
    background-color: var(--color-success-bg);
    color: var(--color-success);
  }
  &.icon-amber {
    background-color: var(--color-warning-bg);
    color: var(--color-warning);
  }
  &.icon-red {
    background-color: var(--color-danger-bg);
    color: var(--color-danger);
  }
}

.doc-icon {
  width: 18px;
  height: 18px;
}

.doc-info {
  display: flex;
  flex-direction: column;
}

.doc-title {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--color-primary-navy);
}

.doc-date {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.doc-badge {
  font-size: 10.5px;
  font-weight: 800;
  padding: 4px 8px;
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: 0.04em;

  &.badge-green {
    background-color: var(--color-success-bg);
    color: var(--color-success);
  }
  &.badge-amber {
    background-color: var(--color-warning-bg);
    color: var(--color-warning);
  }
  &.badge-red {
    background-color: var(--color-danger-bg);
    color: var(--color-danger);
  }
}
</style>
