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

    async login(username: string, password: string): Promise<boolean> {
      this.loading = true;
      this.error = '';
      const config = useRuntimeConfig();

      try {
        const res = await $fetch<{ access_token: string }>(`${config.public.apiBase}/auth/login`, {
          method: 'POST',
          body: { username, password },
          timeout: 4000,
        });

        if (res && res.access_token) {
          this.setToken(res.access_token);
          await this.fetchProfile();
          this.loading = false;
          return true;
        }
      } catch (err: any) {
        if (err.status === 401 || err.statusCode === 401) {
          this.loading = false;
          this.error = 'Invalid pilot credentials. Please check username and password.';
          return false;
        }

        // If backend server is unreachable (e.g. GitHub Pages static demo)
        // Fall back to offline validation against hardcoded pilot account
        if (username === 'johndoe' && password === 'susiairtest') {
          console.warn('Backend server offline, activating authenticated pilot session.');
          const offlineToken = 'mock_jwt_token_johndoe_susi_air_2026';
          this.setToken(offlineToken);
          this.pilot = {
            name: 'John Doe',
            totalFlightHours: 1444.5,
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
          };
          this.loading = false;
          return true;
        }

        this.loading = false;
        this.error = 'Invalid pilot credentials. Please check username and password.';
        return false;
      }

      this.loading = false;
      return false;
    },

    async fetchProfile() {
      if (!this.token) return;
      const config = useRuntimeConfig();

      try {
        const res = await $fetch<PilotProfile>(`${config.public.apiBase}/pilot/me`, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
          timeout: 3000,
        });
        if (res) {
          this.pilot = res;
        }
      } catch (err: any) {
        if (err.status === 401) {
          this.clearAuth();
        } else {
          if (!this.pilot) {
            this.pilot = {
              name: 'John Doe',
              totalFlightHours: 1444.5,
              avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
            };
          }
        }
      }
    },

    logout() {
      this.clearAuth();
      navigateTo('/login');
    },
  },
});
