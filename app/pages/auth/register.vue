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
  <div class="auth-form">
    <h1>Регистрация</h1>

    <div v-if="errors.general" class="error-banner">{{ errors.general[0] }}</div>

    <form @submit.prevent="handleRegister">
      <div class="field">
        <label for="name">Имя</label>
        <input id="name" v-model="form.name" type="text" :disabled="isLoading" />
        <span v-if="errors.name" class="error">{{ errors.name[0] }}</span>
      </div>

      <div class="field">
        <label for="email">Email</label>
        <input id="email" v-model="form.email" type="email" :disabled="isLoading" />
        <span v-if="errors.email" class="error">{{ errors.email[0] }}</span>
      </div>

      <div class="field">
        <label for="password">Пароль</label>
        <input id="password" v-model="form.password" type="password" :disabled="isLoading" />
        <span v-if="errors.password" class="error">{{ errors.password[0] }}</span>
      </div>

      <div class="field">
        <label for="password_confirmation">Подтверждение пароля</label>
        <input id="password_confirmation" v-model="form.password_confirmation" type="password" :disabled="isLoading" />
      </div>

      <button type="submit" :disabled="isLoading">
        {{ isLoading ? 'Регистрация...' : 'Зарегистрироваться' }}
      </button>
    </form>

    <NuxtLink to="/auth/login">Уже есть аккаунт? Войти</NuxtLink>
  </div>
</template>