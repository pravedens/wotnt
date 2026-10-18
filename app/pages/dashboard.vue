<script setup lang="ts">
import type { AuthUser } from '~/types/auth';

definePageMeta({
  middleware: 'sanctum:auth',
});

const { user, logout, refreshIdentity } = useSanctumAuth<AuthUser>();
const banners = useBanners();
const client = useSanctumClient();

const refreshing = ref(false);
const EMAIL_UNVERIFIED_KEY = 'email-unverified';

// Переменная для отслеживания времени ухода со вкладки
let lastHiddenTime = 0;

const refreshUser = async (showError = true) => {
  if (refreshing.value) return;
  refreshing.value = true;

  try {
    await refreshIdentity();
  } catch (error) {
    console.error('Не удалось обновить пользователя:', error);
    if (showError) {
      banners.error('Не удалось получить актуальный статус почты.');
    }
  } finally {
    refreshing.value = false;
  }
};

const syncEmailBanner = () => {
  if (!user.value) {
    banners.removeByKey(EMAIL_UNVERIFIED_KEY);
    return;
  }

  if (user.value.email_verified_at) {
    banners.removeByKey(EMAIL_UNVERIFIED_KEY);
    return;
  }

  banners.upsertByKey(EMAIL_UNVERIFIED_KEY, {
    type: 'warning',
    title: 'Email не подтверждён',
    message: 'Подтвердите email, чтобы получить полный доступ к функциям.',
    persistent: true,
  });
};

const resendVerification = async () => {
  try {
    await client('/email/verification-notification', { method: 'POST' });
    banners.success('Письмо отправлено. Проверьте почту.');
  } catch (error: any) {
    const msg =
      error.response?._data?.message ??
      'Не удалось отправить письмо. Попробуйте позже.';
    banners.error(msg);
  }
};

// --- ЛОГИКА ОБНОВЛЕНИЯ ПРИ ВОЗВРАТЕ НА ВКЛАДКУ ---

const handleVisibilityChange = () => {
  if (document.visibilityState === 'hidden') {
    // Запоминаем время, когда пользователь ушёл со вкладки
    lastHiddenTime = Date.now();
  } else if (document.visibilityState === 'visible') {
    // Если прошло больше 2 секунд, обновляем данные (без спама ошибками)
    if (Date.now() - lastHiddenTime > 2000) {
      refreshUser(false); 
    }
  }
};

onMounted(async () => {
  // Первичная загрузка
  await refreshUser();
  syncEmailBanner();
  
  // Подписываемся на изменение видимости вкладки
  document.addEventListener('visibilitychange', handleVisibilityChange);
});

onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange);
});

// Обновление баннера при изменении user
watch(user, () => {
  syncEmailBanner();
});

const handleLogout = async () => {
  banners.clear();
  await logout();
  await navigateTo('/auth/login');
};
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

    <div class="mb-8">
      <h1 class="text-3xl sm:text-4xl font-bold text-white mb-2">Dashboard</h1>
      <p class="text-gray-300">Добро пожаловать в личный кабинет.</p>
    </div>

    <!-- Карточка профиля -->
    <div class="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6 sm:p-8 mb-6">
      <div class="flex items-start justify-between gap-4 flex-wrap">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-500/30 shrink-0">
            {{ (user?.name ?? 'Г').charAt(0).toUpperCase() }}
          </div>
          <div>
            <p class="text-lg font-semibold text-white">
              Привет, {{ user?.name ?? 'гость' }}
            </p>
            <p v-if="user?.email" class="text-sm text-gray-300 mt-0.5">
              {{ user.email }}
            </p>
          </div>
        </div>

        <button
          type="button"
          @click="handleLogout"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-200 border border-white/20 hover:text-white hover:bg-white/10 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Выйти
        </button>
      </div>
    </div>

    <!-- Карточка статуса аккаунта -->
    <div class="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-6 sm:p-8">
      <h2 class="text-lg font-semibold text-white mb-4">Статус аккаунта</h2>

      <div v-if="refreshing" class="flex items-center gap-3 text-gray-300">
        <svg class="w-5 h-5 animate-spin text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        Проверяем статус почты…
      </div>

      <div
        v-else-if="user?.email_verified_at"
        class="flex items-center gap-3 p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-200 text-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Email подтверждён
      </div>

            <div v-else-if="user" class="space-y-4">
        <!-- Плашка о том, что email не подтверждён -->
        <div class="flex items-start gap-3 p-4 bg-amber-500/20 border border-amber-500/50 rounded-lg text-amber-200 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p class="font-semibold mb-1">Требуется подтверждение</p>
            <p class="opacity-90">
              Мы отправили письмо на <span class="font-medium text-white">{{ user.email }}</span>. 
              Перейдите по ссылке в письме, чтобы активировать аккаунт.
            </p>
          </div>
        </div>

        <!-- Блок с кнопкой и подсказкой -->
        <div class="pt-2">
          <p class="text-xs text-gray-400 mb-3">
            Не получили письмо или ссылка устарела? Проверьте папку «Спам» или запросите новое письмо.
          </p>
          <button
            type="button"
            @click="resendVerification"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-white/10 border border-white/20 hover:bg-white/20 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Отправить письмо повторно
          </button>
        </div>
      </div>
    </div>

  </div>
</template>