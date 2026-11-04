<script setup lang="ts">
import type { HomeUser } from '~/types/home';

defineProps<{
  deceased: HomeUser[];
}>();
</script>

<template>
  <section class="rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-8">
    <h2 class="text-2xl font-bold text-white mb-6 flex items-center gap-3">
      🕊️ Помним и любим
    </h2>
    <div v-if="deceased.length" class="flex flex-wrap gap-4">
      <HomeUserCard
        v-for="d in deceased"
        :key="d.id"
        :user="d"
        variant="deceased"
      />
    </div>
    <p v-else class="text-gray-400">Информация отсутствует.</p>
  </section>
</template>