<script setup lang="ts">
import type { ForgotPasswordResponse } from '~/types/auth';

definePageMeta({
  layout: 'auth',
  middleware: 'sanctum:guest',
});

const route = useRoute();
const router = useRouter();
const client = useSanctumClient();

const form = reactive({
  token: (route.query.token as string) || '',
  email: (route.query.email as string) || '',
  password: '',
  password_confirmation: '',
});

const errors = ref<Record<string, string[]>>({});
const isLoading = ref(false);

const handleReset = async () => {
  errors.value = {};
  isLoading.value = true;

  try {
    await client<ForgotPasswordResponse>('/reset-password', {
      method: 'POST',
      body: form,
    });
    await router.push('/auth/login');
  } catch (error: any) {
    if (error.response?._data?.errors) {
      errors.value = error.response._data.errors;
    } else {
      errors.value = { general: ['Не удалось сбросить пароль.'] };
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold text-center mb-3">Сброс пароля</h1>
    <p class="text-center text-sm text-gray-300 mb-6">
      Придумайте новый пароль для вашего аккаунта.
    </p>

    <!-- Баннер общей ошибки -->
    <div 
      v-if="errors.general" 
      class="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center"
    >
      {{ errors.general[0] }}
    </div>

    <form @submit.prevent="handleReset" class="space-y-4">
      
      <!-- Поле Email (только для чтения) -->
      <div class="space-y-1">
        <label for="email" class="block text-sm font-medium text-gray-200">Email</label>
        <input 
          id="email" 
          v-model="form.email" 
          type="email" 
          autocomplete="email" 
          readonly
          :disabled="isLoading"
          class="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 cursor-not-allowed focus:outline-none transition duration-200"
        />
        <span v-if="errors.email" class="text-xs text-red-300 block">{{ errors.email[0] }}</span>
      </div>

      <!-- Поле Новый пароль -->
      <div class="space-y-1">
        <label for="password" class="block text-sm font-medium text-gray-200">Новый пароль</label>
        <input 
          id="password" 
          v-model="form.password" 
          type="password" 
          autocomplete="new-password" 
          :disabled="isLoading"
          class="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:opacity-70"
          placeholder="Введите новый пароль"
        />
        <span v-if="errors.password" class="text-xs text-red-300 block">{{ errors.password[0] }}</span>
      </div>

      <!-- Поле Подтверждение пароля -->
      <div class="space-y-1">
        <label for="password_confirmation" class="block text-sm font-medium text-gray-200">Подтверждение пароля</label>
        <input 
          id="password_confirmation" 
          v-model="form.password_confirmation" 
          type="password" 
          autocomplete="new-password" 
          :disabled="isLoading"
          class="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:opacity-70"
          placeholder="Повторите новый пароль"
        />
      </div>

      <!-- Кнопка Сбросить -->
      <button 
        type="submit" 
        :disabled="isLoading"
        class="w-full py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 transition duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-2"
      >
        {{ isLoading ? 'Сброс...' : 'Сбросить пароль' }}
      </button>
    </form>

    <!-- Ссылка на вход -->
    <div class="mt-6 text-center text-sm text-gray-300">
      Вспомнили пароль? 
      <NuxtLink to="/auth/login" class="text-white font-medium hover:underline ml-1">
        Войти
      </NuxtLink>
    </div>
  </div>
</template>