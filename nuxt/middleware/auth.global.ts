export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();
  authStore.initAuth();

  if (to.path !== '/login' && !authStore.isAuthenticated) {
    return navigateTo('/login');
  }

  if (to.path === '/login' && authStore.isAuthenticated) {
    return navigateTo('/');
  }
});
