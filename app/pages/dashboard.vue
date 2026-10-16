<script setup lang="ts">
import type { AuthUser } from '~/types/auth';

definePageMeta({
  middleware: 'sanctum:auth',
});

const { user, logout, refreshIdentity } = useSanctumAuth<AuthUser>();

const refreshing = ref(false);
const refreshError = ref('');

const refreshUser = async () => {
  if (refreshing.value) return;

  refreshing.value = true;
  refreshError.value = '';

  try {
    await refreshIdentity();
  } catch (error) {
    console.error('Не удалось обновить пользователя:', error);
    refreshError.value = 'Не удалось получить актуальный статус почты.';
  } finally {
    refreshing.value = false;
  }
};

const handleFocus = () => {
  void refreshUser();
};

onMounted(() => {
  void refreshUser();
  window.addEventListener('focus', handleFocus);
});

onBeforeUnmount(() => {
  window.removeEventListener('focus', handleFocus);
});

const handleLogout = async () => {
  await logout();
  await navigateTo('/auth/login');
};
</script>

<template>
  <div class="dashboard">
    <h1>Dashboard</h1>

    <p>Привет, {{ user?.name ?? 'гость' }}</p>
    <p v-if="user?.email">Email: {{ user.email }}</p>

    <p v-if="refreshing">Проверяем статус почты…</p>
    <p v-else-if="refreshError" role="alert">
      {{ refreshError }}
    </p>
    <p v-else-if="user?.email_verified_at">
      Email подтверждён
    </p>
    <p v-else-if="user">
      Email не подтверждён
    </p>

    <button type="button" @click="handleLogout">
      Выйти
    </button>
  </div>
</template>
