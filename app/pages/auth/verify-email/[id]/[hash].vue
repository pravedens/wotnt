<script setup lang="ts">
const route = useRoute();
const router = useRouter();

const { user, refreshIdentity } = useSanctumAuth();

const status = ref<'loading' | 'success' | 'error'>('loading');
const message = ref('Подтверждаем ваш email...');

onMounted(async () => {
  try {
    const { id, hash } = route.params;
    const { expires, signature } = route.query;

    const apiUrl = `https://api.wotnt.test:8443/email/verify/${id}/${hash}?expires=${expires}&signature=${signature}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });

    if (response.ok) {
      status.value = 'success';
      message.value = 'Email успешно подтверждён!';

      // Обновляем профиль только если пользователь авторизован в этом браузере
      if (user.value) {
        try {
          await refreshIdentity();
        } catch (error) {
          console.error('Не удалось обновить данные пользователя:', error);
          // Не меняем message на ошибку — email уже подтверждён
        }
      }

      setTimeout(() => router.push('/dashboard'), 2500);
    } else if (response.status === 403) {
      status.value = 'error';
      message.value = 'Ссылка недействительна или истекла.';
    } else {
      status.value = 'error';
      message.value = 'Произошла ошибка при подтверждении.';
    }
  } catch (error) {
    status.value = 'error';
    message.value = 'Ошибка сети.';
  }
});
</script>

<template>
  <div>
    <!-- Заголовок -->
    <h1 class="text-3xl font-bold text-center mb-8">Подтверждение Email</h1>

    <!-- Состояние: загрузка -->
    <div v-if="status === 'loading'" class="flex flex-col items-center gap-4 py-6">
      <div class="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
        <svg class="w-7 h-7 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      </div>
      <p class="text-gray-300 text-center">{{ message }}</p>
    </div>

    <!-- Состояние: успех -->
    <div v-else-if="status === 'success'" class="space-y-5">
      <div class="flex flex-col items-center gap-4 py-4">
        <div class="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="text-emerald-200 font-semibold text-center">{{ message }}</p>
        <p class="text-sm text-gray-400 text-center">Сейчас вы будете перенаправлены в личный кабинет...</p>
      </div>

      <NuxtLink
        to="/dashboard"
        class="w-full py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg shadow-purple-500/20 transition text-center block"
      >
        Перейти в Dashboard
      </NuxtLink>
    </div>

    <!-- Состояние: ошибка -->
    <div v-else class="space-y-5">
      <div class="flex flex-col items-center gap-4 py-4">
        <div class="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="text-red-200 font-semibold text-center">{{ message }}</p>
      </div>

      <div class="flex flex-col sm:flex-row gap-3">
        <NuxtLink
          to="/dashboard"
          class="flex-1 py-2.5 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg shadow-purple-500/20 transition text-center"
        >
          В Dashboard
        </NuxtLink>
        <NuxtLink
          to="/auth/login"
          class="flex-1 py-2.5 px-4 rounded-lg font-semibold text-gray-200 border border-white/20 hover:text-white hover:bg-white/10 transition text-center"
        >
          Войти
        </NuxtLink>
      </div>
    </div>
  </div>
</template>