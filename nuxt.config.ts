// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  vite: {
  server: {
    allowedHosts: ['wotnt.test', 'api.wotnt.test', 'localhost']
  }
},

  modules: ['nuxt-auth-sanctum'],
    sanctum: {
    // Указываем URL к вашему Laravel бэкенду
    baseUrl: 'https://api.wotnt.test:8443',
    // Остальные настройки, такие как endpoints, можно указать здесь
    // endpoints: { login: '/api/login', logout: '/api/logout', user: '/api/user' },
  },
});