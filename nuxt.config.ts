// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: {
    enabled: process.env.NODE_ENV !== "production",
  },

  pages: true,

  vite: {
    server: {
      allowedHosts: ["wotnt.test", "api.wotnt.test", "localhost"],
    },
  },

  modules: ["nuxt-auth-sanctum", "@nuxtjs/tailwindcss", "@vite-pwa/nuxt"],

  tailwindcss: {
    cssPath: "~/assets/css/tailwind.css",
  },

  pwa: {
    // Регистрируем Service Worker и включаем автообновление
    registerType: "autoUpdate",

    // Настройки манифеста (переносим из вашего JSON)
    manifest: {
      name: "Слово Истины",
      short_name: "WoT",
      description: "Местная религиозная организация...",
      start_url: "/",
      scope: "/",
      display: "standalone",
      orientation: "any",
      background_color: "#2f3189",
      theme_color: "#000000",
      icons: [
        { src: "/icons/icon-48x48.png", sizes: "48x48", type: "image/png" },
        { src: "/icons/icon-72x72.png", sizes: "72x72", type: "image/png" },
        { src: "icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
        { src: "icons/icon-128x128.png", sizes: "128x128", type: "image/png" },
        { src: "icons/icon-144x144.png", sizes: "144x144", type: "image/png" },
        { src: "icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
        { src: "icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
        { src: "icons/icon-256x256.png", sizes: "256x256", type: "image/png" },
        { src: "icons/icon-384x384.png", sizes: "384x384", type: "image/png" },
        { src: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
      ],
    },
    // Настройки Workbox для офлайн-кеша
    workbox: {
      // Какие файлы кешировать (апп-шелл)
      globPatterns: ["**/*.{js,css,html,woff2,png,svg,ico,json}"],
      // При навигации офлайн отдавать главную страницу
      navigateFallback: "/",
      // Не кешировать API-запросы, они должны идти в сеть
      navigateFallbackDenylist: [/^\/api\//],
      cleanupOutdatedCaches: true,
    },

    // ВАЖНО: включаем PWA в режиме разработки, чтобы можно было тестировать
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      type: "module",
      navigateFallback: "/",
    },
  },

  sanctum: {
    baseUrl: "https://api.wotnt.test:8443",
    origin: "https://wotnt.test:8443",
    mode: "cookie",
    endpoints: {
      login: "/login",
      logout: "/logout",
      user: "/api/user",
      csrf: "/sanctum/csrf-cookie",
    },
    redirect: {
      // Куда редиректить неавторизованных при попытке зайти на защищённую страницу
      onAuthOnly: "/auth/login",

      // Куда редиректить авторизованных, если они зашли на страницу входа
      onGuestOnly: "/dashboard",

      // Куда редиректить после успешного входа
      onLogin: "/dashboard",

      // Куда редиректить после выхода
      onLogout: "/auth/login",

      // Опционально: запоминать запрошенный URL, чтобы вернуть пользователя туда после входа
      keepRequestedRoute: true,
    },
  },

  app: {
    head: {
      link: [
        // 1. Подключаем манифест
        { rel: "manifest", href: "/manifest.json" },

        // 2. Иконки для браузеров (favicon)
        // Если у вас есть favicon.ico в корне public, оставьте эту строку:
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },

        // Иконки для iOS (Apple Touch Icon)
        // Рекомендуется использовать 180x180, если есть, иначе 192x192
        {
          rel: "apple-touch-icon",
          sizes: "192x192",
          href: "/icons/icon-192x192.png",
        },
      ],
      meta: [
        // 3. Мета-тег для цвета темы (поддерживается Android/Chrome)
        { name: "theme-color", content: "#2f3189" },
      ],
    },
  },
});
