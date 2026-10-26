import { defineStore } from 'pinia';

export interface PilotProfile {
  name: string;
  totalFlightHours: number;
  avatarUrl: string;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: '' as string,
    pilot: null as PilotProfile | null,
    loading: false,
    error: '' as string,
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.token),
  },

  actions: {
    initAuth() {
      if (import.meta.client) {
        const storedToken = localStorage.getItem('susi_pilot_token');
        if (storedToken) {
          this.token = storedToken;
        }
      }
    },

    setToken(token: string) {
      this.token = token;
      if (import.meta.client) {
        localStorage.setItem('susi_pilot_token', token);
      }
    },

    clearAuth() {
      this.token = '';
      this.pilot = null;
      if (import.meta.client) {
        localStorage.removeItem('susi_pilot_token');
      }
    },

    async login(username: string, password: string):Promise<boolean> {
      this.loading = true;
      this.error = '';
      const config = useRuntimeConfig();

      try {
        const res = await $fetch<{ access_token: string }>(`${config.public.apiBase}/auth/login`, {
          method: 'POST',
          body: { username, password },
        });

        if (res && res.access_token) {
          this.setToken(res.access_token);
          await this.fetchProfile();
          this.loading = false;
          return true;
        }
        return false;
      } catch (err: any) {
        this.loading = false;
        if (err.data && err.data.message) {
          this.error = Array.isArray(err.data.message) ? err.data.message.join(', ') : err.data.message;
        } else if (err.status === 401) {
          this.error = 'Invalid pilot credentials. Please check username and password.';
        } else {
          this.error = 'Failed to connect to authentication server. Please try again.';
        }
        return false;
      }
    },

    async fetchProfile() {
      if (!this.token) return;
      const config = useRuntimeConfig();

      try {
        const res = await $fetch<PilotProfile>(`${config.public.apiBase}/pilot/me`, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });
        this.pilot = res;
      } catch (err: any) {
        if (err.status === 401) {
          this.clearAuth();
        }
      }
    },

    logout() {
      this.clearAuth();
      navigateTo('/login');
    },
  },
});
