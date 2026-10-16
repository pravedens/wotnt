<script setup lang="ts">
import type { Banner, BannerType } from '~/composables/useBanners';

const { banners, remove } = useBanners();

/** Соответствие цвета и иконки типу баннера */
const configByType: Record<BannerType, { wrapper: string; icon: string; path: string }> = {
  success: {
    wrapper: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200',
    icon: 'text-emerald-300',
    path: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  error: {
    wrapper: 'bg-red-500/20 border-red-500/50 text-red-200',
    icon: 'text-red-300',
    path: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  warning: {
    wrapper: 'bg-amber-500/20 border-amber-500/50 text-amber-200',
    icon: 'text-amber-300',
    path: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  },
  info: {
    wrapper: 'bg-blue-500/20 border-blue-500/50 text-blue-200',
    icon: 'text-blue-300',
    path: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
};

/** Нажатие на action-кнопку внутри баннера */
const onActionClick = async (banner: Banner, actionIndex: number) => {
  const action = banner.actions?.[actionIndex];
  if (!action) return;
  if (action.loading) return;

  try {
    action.loading = true;
    await action.handler();
  } finally {
    action.loading = false;
  }
};
</script>

<template>
  <!-- Контейнер фиксирован сверху, чтобы баннеры всегда были на виду -->
  <div class="fixed top-20 left-1/2 -translate-x-1/2 z-[60] w-full max-w-2xl px-4 pointer-events-none">
    <TransitionGroup
      tag="div"
      class="space-y-2 pointer-events-auto"
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-for="banner in banners"
        :key="banner.id"
        class="rounded-xl backdrop-blur-md border p-4 shadow-lg"
        :class="configByType[banner.type].wrapper"
      >
        <div class="flex items-start gap-3">
          <!-- Иконка -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5 shrink-0 mt-0.5"
            :class="configByType[banner.type].icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" :d="configByType[banner.type].path" />
          </svg>

          <!-- Контент -->
          <div class="flex-1 min-w-0">
            <p v-if="banner.title" class="font-semibold text-sm">{{ banner.title }}</p>
            <p class="text-sm" :class="{ 'mt-0.5': banner.title }">{{ banner.message }}</p>

            <!-- Кнопки-действия -->
            <div v-if="banner.actions?.length" class="mt-3 flex flex-wrap gap-2">
              <button
                v-for="(action, idx) in banner.actions"
                :key="idx"
                type="button"
                :disabled="action.loading"
                class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                :class="action.variant === 'secondary'
                  ? 'text-white border border-white/30 hover:bg-white/10'
                  : 'text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'"
                @click="onActionClick(banner, idx)"
              >
                <svg
                  v-if="action.loading"
                  class="w-3.5 h-3.5 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {{ action.label }}
              </button>
            </div>
          </div>

          <!-- Кнопка закрытия -->
          <button
            type="button"
            class="shrink-0 p-1 rounded-lg hover:bg-white/10 transition"
            aria-label="Закрыть"
            @click="remove(banner.id)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>