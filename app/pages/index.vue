<script setup lang="ts">
definePageMeta({
  middleware: 'sanctum:auth',
});
</script>

<template>
  <div>
    <h1>Главная</h1>
    <NuxtLink to="/dashboard">Перейти в Dashboard</NuxtLink>
  </div>
</template>