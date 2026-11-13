<script setup lang="ts">
import type { HomepageResponse } from "~/types/home";
import type { AuthUser } from "~/types/auth";

const { user } = useSanctumAuth<AuthUser>();
const client = useSanctumClient();

const isAuthed = computed(() => Boolean(user.value));

const {
  data: homepageData,
  pending: isLoading,
  error: homepageError,
  refresh: refreshHomepage,
} = await useAsyncData(
  "homepage-data",
  () => client<HomepageResponse>("/api/homepage"),
  {
    server: true,
    lazy: true,
  },
);
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-16">
    <!-- Hero -->
    <section class="text-center max-w-3xl mx-auto">
      <h1
        class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6"
      >
        Добро пожаловать в
        <span
          class="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
        >
          Слово Истины
        </span>
      </h1>
      <p class="text-lg sm:text-xl text-gray-300 leading-relaxed mb-10">
        Управляйте данными, отслеживайте прогресс и достигайте целей — всё в
        одном месте.
      </p>
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
        <NuxtLink
          v-if="isAuthed"
          to="/dashboard"
          class="px-6 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg transition"
        >
          Перейти в Dashboard
        </NuxtLink>
      </div>
    </section>

    <!-- Праздники -->
    <div v-if="isLoading" class="text-center text-gray-400 py-10">
      Загрузка...
    </div>

    <div
      v-else-if="homepageError"
      class="text-center p-8 rounded-2xl border border-red-500/20 bg-red-500/10"
    >
      <p class="text-red-300">Не удалось загрузить данные.</p>
      <button
        type="button"
        class="mt-4 text-blue-400 hover:underline"
        @click="refreshHomepage()"
      >
        Повторить
      </button>
    </div>

    <!-- Показываем ТОЛЬКО праздник -->
    <template v-else-if="homepageData?.holiday">
      <HomeHolidayBanner :holiday="homepageData.holiday" />
    </template>

    <!-- Последние проповеди — только на клиенте, чтобы Sanctum видел cookie -->
    <SermonLatest />
  </div>
</template>
