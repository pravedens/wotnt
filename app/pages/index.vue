<script setup lang="ts">
import type { HomepageResponse } from "~/types/home";
import type { AuthUser } from "~/types/auth"; 

// Публичная страница — без middleware.
const { user } = useSanctumAuth<AuthUser>(); 
const config = useRuntimeConfig();

const isAuthed = computed(() => !!user.value);

// Состояние для данных главной страницы
const homepageData = ref<HomepageResponse | null>(null);
const isLoading = ref(true);

// Загружаем данные при монтировании
onMounted(async () => {
  try {
    const response = await $fetch<HomepageResponse>(`${config.public.apiBase}/api/homepage`, {
      credentials: 'include',
    });
    homepageData.value = response;
  } catch (error) {
    console.error("Не удалось загрузить данные главной страницы", error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-16">

    <!-- Hero -->
    <section class="text-center max-w-3xl mx-auto">
      <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6">
        Добро пожаловать в
        <span class="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Слово Истины
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
      </div>
    </section>

    <!-- Новые рубрики (Праздники, Именинники, Ушедшие) -->
    <div v-if="isLoading" class="text-center text-gray-400 py-10">
      Загрузка...
    </div>
    
    <template v-else-if="homepageData">
      <!-- 1. Праздник (видят все) -->
      <HomeHolidayBanner 
        v-if="homepageData.holiday" 
        :holiday="homepageData.holiday" 
      />

      <!-- 2 и 3. Рубрики (только для авторизованных с согласием) -->
      <template v-if="user?.consent_pd">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <HomeBirthdaysBlock :birthdays="homepageData.birthdays" />
          <HomeDeceasedBlock :deceased="homepageData.deceased" />
        </div>
      </template>

      <!-- Призыв войти / дать согласие для тех, кто не видит блоки 2 и 3 -->
      <div v-else-if="!user" class="text-center p-8 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
        <p class="text-gray-300">
          Чтобы видеть дни рождения братьев и сестер, а также мемориальный раздел, пожалуйста,
          <NuxtLink to="/auth/login" class="text-blue-400 hover:underline">войдите в систему</NuxtLink>.
        </p>
      </div>
      <div v-else class="text-center p-8 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
        <p class="text-gray-300">
          Чтобы видеть данные о братьях и сестрах, пожалуйста,
          <NuxtLink to="/auth/profile" class="text-amber-400 hover:underline">дайте согласие на обработку персональных данных</NuxtLink> в профиле.
        </p>
      </div>
    </template>

    <!-- Возможности (оставляем как было) -->
    <section class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- ... Код блока "Возможности" из вашего исходника ... -->
    </section>

  </div>
</template>