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
  <div class="auth-form">
    <h1>Сброс пароля</h1>

    <div v-if="errors.general" class="error-banner">{{ errors.general[0] }}</div>

    <form @submit.prevent="handleReset">
      <div class="field">
        <label for="email">Email</label>
        <input id="email" v-model="form.email" type="email" :disabled="isLoading" />
        <span v-if="errors.email" class="error">{{ errors.email[0] }}</span>
      </div>

      <div class="field">
        <label for="password">Новый пароль</label>
        <input id="password" v-model="form.password" type="password" :disabled="isLoading" />
        <span v-if="errors.password" class="error">{{ errors.password[0] }}</span>
      </div>

      <div class="field">
        <label for="password_confirmation">Подтверждение пароля</label>
        <input id="password_confirmation" v-model="form.password_confirmation" type="password" :disabled="isLoading" />
      </div>

      <button type="submit" :disabled="isLoading">
        {{ isLoading ? 'Сброс...' : 'Сбросить пароль' }}
      </button>
    </form>
  </div>
</template>