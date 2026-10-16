<script setup lang="ts">
// Публичная страница — без middleware.
// Sanctum сам подтянет user, если пользователь авторизован,
// и мы сможем показать ему кнопку "Перейти в Dashboard" вместо "Начать".
const { user } = useSanctumAuth();

const isAuthed = computed(() => !!user.value);
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

    <!-- Hero -->
    <section class="text-center max-w-3xl mx-auto">
      <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6">
        Добро пожаловать в
        <span class="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          WoW
        </span>
      </h1>
      <p class="text-lg sm:text-xl text-gray-300 leading-relaxed mb-10">
        Управляйте данными, отслеживайте прогресс и достигайте целей — всё в одном месте.
      </p>

      <!-- CTA -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
        <NuxtLink
          v-if="isAuthed"
          to="/dashboard"
          class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg shadow-purple-500/20 transition"
        >
          Перейти в Dashboard
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </NuxtLink>

        <template v-else>
          <NuxtLink
            to="/auth/register"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg shadow-purple-500/20 transition"
          >
            Начать бесплатно
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </NuxtLink>
          <NuxtLink
            to="/auth/login"
            class="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-gray-200 border border-white/20 hover:text-white hover:bg-white/10 transition"
          >
            У меня есть аккаунт
          </NuxtLink>
        </template>
      </div>
    </section>

    <!-- Возможности -->
    <section class="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 transition">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-white mb-2">Быстро</h3>
        <p class="text-sm text-gray-300 leading-relaxed">
          Мгновенный отклик и высокая производительность на любых устройствах.
        </p>
      </div>

      <div class="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 transition">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-white mb-2">Безопасно</h3>
        <p class="text-sm text-gray-300 leading-relaxed">
          Надёжная защита данных и соответствие современным стандартам.
        </p>
      </div>

      <div class="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/20 transition">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-white mb-2">Гибко</h3>
        <p class="text-sm text-gray-300 leading-relaxed">
          Настраивайте под себя всё — от интерфейса до бизнес-логики.
        </p>
      </div>
    </section>

  </div>
</template>