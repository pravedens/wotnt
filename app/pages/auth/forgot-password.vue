<script setup lang="ts">
import type { ForgotPasswordResponse } from '~/types/auth';

definePageMeta({
  layout: 'auth',
  middleware: 'sanctum:guest',
});

const client = useSanctumClient();

const email = ref('');
const errors = ref<Record<string, string[]>>({});
const status = ref<string | null>(null);
const isLoading = ref(false);

const handleSubmit = async () => {
  errors.value = {};
  status.value = null;
  isLoading.value = true;

  try {
    const response = await client<ForgotPasswordResponse>('/forgot-password', {
      method: 'POST',
      body: { email: email.value },
    });
    status.value = response.status ?? 'Ссылка отправлена на указанный email.';
  } catch (error: any) {
    if (error.response?._data?.errors) {
      errors.value = error.response._data.errors;
    } else {
      errors.value = { general: ['Не удалось отправить ссылку.'] };
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold text-center mb-3">Восстановление пароля</h1>
    <p class="text-center text-sm text-gray-300 mb-6">
      Укажите email, и мы отправим ссылку для сброса пароля.
    </p>

    <!-- Баннер успеха (зеленый) -->
    <div 
      v-if="status" 
      class="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-200 text-sm text-center"
    >
      {{ status }}
    </div>

    <!-- Баннер общей ошибки (красный) -->
    <div 
      v-if="errors.general" 
      class="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center"
    >
      {{ errors.general[0] }}
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-5">
      
      <!-- Поле Email -->
      <div class="space-y-1">
        <label for="email" class="block text-sm font-medium text-gray-200">Email</label>
        <input 
          id="email" 
          v-model="email" 
          type="email" 
          autocomplete="email" 
          :disabled="isLoading"
          class="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:opacity-70"
          placeholder="Ваша почта"
        />
        <span v-if="errors.email" class="text-xs text-red-300 block">{{ errors.email[0] }}</span>
      </div>

      <!-- Кнопка Отправить -->
      <button 
        type="submit" 
        :disabled="isLoading"
        class="w-full py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 transition duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ isLoading ? 'Отправка...' : 'Отправить ссылку' }}
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