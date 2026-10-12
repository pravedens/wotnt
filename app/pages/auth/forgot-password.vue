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
  <div class="auth-form">
    <h1>Восстановление пароля</h1>
    <p>Укажите email, и мы отправим ссылку для сброса пароля.</p>

    <div v-if="status" class="status-banner">{{ status }}</div>
    <div v-if="errors.general" class="error-banner">{{ errors.general[0] }}</div>

    <form @submit.prevent="handleSubmit">
      <div class="field">
        <label for="email">Email</label>
        <input id="email" v-model="email" type="email" :disabled="isLoading" />
        <span v-if="errors.email" class="error">{{ errors.email[0] }}</span>
      </div>

      <button type="submit" :disabled="isLoading">
        {{ isLoading ? 'Отправка...' : 'Отправить ссылку' }}
      </button>
    </form>

    <NuxtLink to="/auth/login">Вернуться ко входу</NuxtLink>
  </div>
</template>