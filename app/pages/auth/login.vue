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
  <div class="auth-form">
    <h1>Вход</h1>

    <div v-if="errors.general" class="error-banner">{{ errors.general[0] }}</div>

    <form @submit.prevent="handleLogin">
      <div class="field">
        <label for="email">Email</label>
        <input id="email" v-model="form.email" type="email" autocomplete="email" :disabled="isLoading" />
        <span v-if="errors.email" class="error">{{ errors.email[0] }}</span>
      </div>

      <div class="field">
        <label for="password">Пароль</label>
        <input id="password" v-model="form.password" type="password" autocomplete="current-password" :disabled="isLoading" />
        <span v-if="errors.password" class="error">{{ errors.password[0] }}</span>
      </div>

      <div class="field-checkbox">
        <input id="remember" v-model="form.remember" type="checkbox" :disabled="isLoading" />
        <label for="remember">Запомнить меня</label>
      </div>

      <button type="submit" :disabled="isLoading">
        {{ isLoading ? 'Вход...' : 'Войти' }}
      </button>
    </form>

    <div class="links">
      <NuxtLink to="/auth/forgot-password">Забыли пароль?</NuxtLink>
      <NuxtLink to="/auth/register">Регистрация</NuxtLink>
    </div>
  </div>
</template>