<script setup lang="ts">
import type { AuthUser } from '~/types/auth';

definePageMeta({
  middleware: 'sanctum:auth',
});

const { user, logout } = useSanctumAuth<AuthUser>();

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
    <button type="button" @click="handleLogout">Выйти</button>
  </div>
</template>