// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  pages: true,

  vite: {
    server: {
      allowedHosts: ["wotnt.test", "api.wotnt.test", "localhost"],
    },
  },

  modules: ["nuxt-auth-sanctum"],
  sanctum: {
    baseUrl: 'https://api.wotnt.test:8443',
    origin: 'https://wotnt.test:8443',
    mode: 'cookie',
    endpoints: {
      login: '/login',
      logout: '/logout',
      user: '/api/user',
      csrf: '/sanctum/csrf-cookie',
    },
    redirect: {
      // Куда редиректить неавторизованных при попытке зайти на защищённую страницу
      onAuthOnly: '/auth/login',

      // Куда редиректить авторизованных, если они зашли на страницу входа
      onGuestOnly: '/dashboard',

      // Куда редиректить после успешного входа
      onLogin: '/dashboard',

      // Куда редиректить после выхода
      onLogout: '/auth/login',

      // Опционально: запоминать запрошенный URL, чтобы вернуть пользователя туда после входа
      keepRequestedRoute: true,
    },
  },
});
