<script setup lang="ts">
import type { AuthUser } from '~/types/auth';

definePageMeta({
  layout: 'auth',
  middleware: 'sanctum:guest',
});

const { refreshIdentity } = useSanctumAuth<AuthUser>();
const client = useSanctumClient();
const router = useRouter();

const form = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
});

const errors = ref<Record<string, string[]>>({});
const isLoading = ref(false);

const handleRegister = async () => {
  errors.value = {};
  isLoading.value = true;

  try {
    await client('/register', {
      method: 'POST',
      body: form,
    });
    await refreshIdentity();
    await router.push('/dashboard');
  } catch (error: any) {
    if (error.response?._data?.errors) {
      errors.value = error.response._data.errors;
    } else {
      errors.value = { general: ['Не удалось зарегистрироваться.'] };
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold text-center mb-8">Регистрация</h1>

    <!-- Баннер общей ошибки -->
    <div 
      v-if="errors.general" 
      class="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center"
    >
      {{ errors.general[0] }}
    </div>

    <form @submit.prevent="handleRegister" class="space-y-4">
      
      <!-- Поле Имя -->
      <div class="space-y-1">
        <label for="name" class="block text-sm font-medium text-gray-200">Имя</label>
        <input 
          id="name" 
          v-model="form.name" 
          type="text" 
          autocomplete="name"
          :disabled="isLoading"
          class="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:opacity-70"
          placeholder="Иван"
        />
        <span v-if="errors.name" class="text-xs text-red-300 block">{{ errors.name[0] }}</span>
      </div>

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
          placeholder="Ваша почта"
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
          autocomplete="new-password" 
          :disabled="isLoading"
          class="w-full px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:opacity-70"
          placeholder="Придумайте пароль"
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
          placeholder="Повторите пароль"
        />
      </div>

      <!-- Кнопка Регистрация -->
      <button 
        type="submit" 
        :disabled="isLoading"
        class="w-full py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 transition duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-2"
      >
        {{ isLoading ? 'Регистрация...' : 'Зарегистрироваться' }}
      </button>
    </form>

    <!-- Ссылка на вход -->
    <div class="mt-6 text-center text-sm text-gray-300">
      Уже есть аккаунт? 
      <NuxtLink to="/auth/login" class="text-white font-medium hover:underline ml-1">
        Войти
      </NuxtLink>
    </div>
  </div>
</template>