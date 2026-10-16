<script setup lang="ts">
import type { AuthUser } from '~/types/auth';

definePageMeta({
  layout: 'auth',
  middleware: 'sanctum:guest',
});

const { login } = useSanctumAuth<AuthUser>();
const router = useRouter();

const form = reactive({
  email: '',
  password: '',
  remember: false,
});

const errors = ref<Record<string, string[]>>({});
const isLoading = ref(false);

const handleLogin = async () => {
  errors.value = {};
  isLoading.value = true;

  try {
    await login(form);
    await router.push('/dashboard');
  } catch (error: any) {
    if (error.response?._data?.errors) {
      errors.value = error.response._data.errors;
    } else {
      errors.value = { general: ['Не удалось войти. Проверьте данные.'] };
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold text-center mb-8">Вход</h1>

    <!-- Баннер общей ошибки -->
    <div 
      v-if="errors.general" 
      class="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center"
    >
      {{ errors.general[0] }}
    </div>

    <form @submit.prevent="handleLogin" class="space-y-5">
      
      <!-- Поле Email -->
      <div class="space-y-1">
        <label for="email" class="block text-sm font-medium text-gray-200">Email</label>
        <input 
          id="email" 
          v-model="form.email" 
          type="email" 
          autocomplete="email" 
          :disabled="isLoading"
          class="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:opacity-70"
          placeholder="Введите вашу почту"
        />
        <span v-if="errors.email" class="text-xs text-red-300 block">{{ errors.email[0] }}</span>
      </div>

      <!-- Поле Пароль -->
      <div class="space-y-1">
        <label for="password" class="block text-sm font-medium text-gray-200">Пароль</label>
        <input 
          id="password" 
          v-model="form.password" 
          type="password" 
          autocomplete="current-password" 
          :disabled="isLoading"
          class="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:opacity-70"
          placeholder="Введите ваш пароль"
        />
        <span v-if="errors.password" class="text-xs text-red-300 block">{{ errors.password[0] }}</span>
      </div>

      <!-- Чекбокс и Забыли пароль -->
      <div class="flex items-center justify-between text-sm">
        <div class="flex items-center">
          <input 
            id="remember" 
            v-model="form.remember" 
            type="checkbox" 
            :disabled="isLoading"
            class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white/20 border-white/30"
          />
          <label for="remember" class="ml-2 block text-gray-200 cursor-pointer">Запомнить меня</label>
        </div>
        
        <NuxtLink to="/auth/forgot-password" class="text-blue-300 hover:text-blue-200 transition hover:underline">
          Забыли пароль?
        </NuxtLink>
      </div>

      <!-- Кнопка Войти -->
      <button 
        type="submit" 
        :disabled="isLoading"
        class="w-full py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 transition duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ isLoading ? 'Вход...' : 'Войти' }}
      </button>
    </form>

    <!-- Ссылка на регистрацию -->
    <div class="mt-6 text-center text-sm text-gray-300">
      Нет аккаунта? 
      <NuxtLink to="/auth/register" class="text-white font-medium hover:underline ml-1">
        Зарегистрироваться
      </NuxtLink>
    </div>
  </div>
</template>