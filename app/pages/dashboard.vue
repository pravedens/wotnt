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
    <p v-if="user?.email_verified_at">Email подтверждён</p>
    <p v-else>Email не подтверждён</p>
    <button type="button" @click="handleLogout">Выйти</button>
  </div>
</template>